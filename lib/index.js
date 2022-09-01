"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordBot = exports.Logger = exports.Store = exports.VoicePresence = exports.Command = exports.User = exports.Message = exports.Client = void 0;
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const node_persist_1 = __importDefault(require("node-persist"));
const actions_1 = require("./actions");
const config_1 = require("./config");
const foundation_1 = require("./foundation");
const logger_1 = require("./logger");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
var foundation_2 = require("./foundation");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return foundation_2.ArmoredClient; } });
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return foundation_2.ArmoredMessage; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return foundation_2.ArmoredUser; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return foundation_2.Command; } });
Object.defineProperty(exports, "VoicePresence", { enumerable: true, get: function () { return foundation_2.VoicePresence; } });
var storage_1 = require("./storage");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return storage_1.PrivateStorage; } });
var winston_1 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_1.Logger; } });
class DiscordBot {
    constructor(options) {
        this.actions = new Map();
        this.middleware = new Map();
        const config = (0, config_1.getCompleteConfig)(options);
        this.log = (0, logger_1.initLogger)(config);
        this.config = config.data;
        this.prefix = config.prefix;
        this.token = config.token;
        this.adminRole = config.admin;
        this.client = new discord_js_1.Client({
            intents: config.intents
        });
        this.formatter = new utils_1.Formatter(this.prefix, this.adminRole, this.client);
        this.store = node_persist_1.default;
        this.emitter = new events_1.default();
    }
    listActions() {
        return Object.keys(Object.fromEntries(this.actions));
    }
    listMiddlewares() {
        return Object.keys(Object.fromEntries(this.middleware));
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.destroy();
            this.log.info('Bot logged out and shutdown');
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            this.log.info('Starting Discord Bot...');
            try {
                yield this.client.login(this.token);
                if (this.client.user != null) {
                    this.log.info(`${this.client.user.username} has logged in and started!`);
                }
                else {
                    this.log.info('Logged in and started!');
                }
            }
            catch (err) {
                this.log.error(`Failed to login: ${JSON.stringify(err)}`);
            }
        });
    }
    runAction(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg.content == null || (msg.author == null)) {
                this.log.debug('Got message without content OR author. Ignoring...');
                return;
            }
            if (this.client.user == null || msg.author.equals(this.client.user))
                return;
            if (!msg.content.startsWith(this.prefix))
                return;
            const command = new foundation_1.Command(msg.content);
            const message = new foundation_1.ArmoredMessage(msg, this.formatter);
            const action = this.actions.get(command.command);
            if (action == null) {
                let helpCmd = 'help';
                for (const action of Object.values(this.actions)) {
                    if (action instanceof actions_1.HelpAction)
                        helpCmd = action.name;
                }
                yield message.reply(`\`:prefix:${command.command}\` is not a command. Use \`:prefix:${helpCmd}\` to see all commands.`);
                return;
            }
            const authorized = yield this.applyMiddleware(action.asContext(), message);
            if (!authorized)
                return;
            yield action.runClient(message);
        });
    }
    loadActions(...actionsParam) {
        for (const action of actionsParam) {
            const armoredAction = new foundation_1.ArmoredAction(action, this.store, this.log, new foundation_1.ArmoredClient(this.client));
            const actionContext = armoredAction.asContext();
            this.actions.set(action.name, armoredAction);
            this.emitter.emit('actionLoaded', actionContext);
        }
    }
    loadMiddleware(...middlewareParam) {
        for (const middleware of middlewareParam) {
            this.middleware.set(middleware.name, new foundation_1.ArmoredMiddleware(middleware, this.store, this.log, new foundation_1.ArmoredClient(this.client)));
        }
    }
    initStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.init({
                dir: './data',
                expiredInterval: 1 * 60 * 1000
            });
            this.log.info('Initialized data store');
        });
    }
    initMiddlewares() {
        return __awaiter(this, void 0, void 0, function* () {
            const botifulMiddleware = [
                new middleware_1.AdminAccessMiddleware(this.adminRole),
                new middleware_1.RbacMiddleware(this.emitter, [...this.actions.values()].map((x) => x.asContext()))
            ];
            this.loadMiddleware(...botifulMiddleware);
            const middlewaresWithInit = Object.values(this.middleware).map((x) => x.initializeClient);
            yield Promise.all(middlewaresWithInit);
            this.log.info(`Middlewares loaded and initialized: [ ${this.listMiddlewares().join(', ')} ]`);
        });
    }
    initActions() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentActions = [...this.actions.values()].map((x) => x.asContext());
            const botifulActions = [
                new actions_1.HelpAction(this.emitter, currentActions),
                new actions_1.ManCommand(this.emitter, currentActions)
            ];
            this.loadActions(...botifulActions);
            const actionsInit = Object.values(this.actions).map((x) => x.initializeClient);
            yield Promise.all(actionsInit);
            this.log.info(`Actions loaded and initialized: [ ${this.listActions().join(', ')} ]`);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initStorage();
            yield Promise.all([this.initMiddlewares(), this.initActions()]);
            this.client.on('messageCreate', (msg) => __awaiter(this, void 0, void 0, function* () { return yield this.runAction(msg); }));
            this.client.on('messageUpdate', (oldMsg, newMsg) => __awaiter(this, void 0, void 0, function* () {
                if (oldMsg.content === newMsg.content ||
                    (newMsg.embeds.length > 0 && oldMsg.embeds.length === 0)) {
                    return;
                }
                yield this.runAction(newMsg);
            }));
        });
    }
    applyMiddleware(action, message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const middleware of this.middleware.values()) {
                const passes = yield middleware.applyClient(action, message);
                if (!passes) {
                    return false;
                }
            }
            return true;
        });
    }
}
exports.DiscordBot = DiscordBot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTREO0FBQzVELG9EQUFpQztBQUNqQyxnRUFBb0Q7QUFHcEQsdUNBQWtEO0FBQ2xELHFDQUErRDtBQUMvRCw2Q0FHcUI7QUFDckIscUNBQXFDO0FBQ3JDLDZDQUFvRTtBQUVwRSxtQ0FBbUM7QUFFbkMsMkNBVXFCO0FBUnBCLG9HQUFBLGFBQWEsT0FBVTtBQUN2QixxR0FBQSxjQUFjLE9BQVc7QUFDekIsa0dBQUEsV0FBVyxPQUFRO0FBQ25CLHFHQUFBLE9BQU8sT0FBQTtBQUlQLDJHQUFBLGFBQWEsT0FBQTtBQUVkLHFDQUFtRDtBQUExQyxnR0FBQSxjQUFjLE9BQVM7QUFDaEMsbUNBQWdDO0FBQXZCLGlHQUFBLE1BQU0sT0FBQTtBQUVmLE1BQWEsVUFBVTtJQWN0QixZQUFvQixPQUEwQjtRQVA3QixZQUFPLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUE7UUFDcEQsZUFBVSxHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBTzNFLE1BQU0sTUFBTSxHQUFHLElBQUEsMEJBQWlCLEVBQUMsT0FBTyxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFBLG1CQUFVLEVBQUMsTUFBTSxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFBO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDO1lBQ3hCLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTztTQUN2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