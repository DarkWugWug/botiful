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
exports.DiscordBot = exports.Logger = exports.Store = exports.Command = exports.User = exports.Message = void 0;
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
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return foundation_2.ArmoredMessage; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return foundation_2.ArmoredUser; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return foundation_2.Command; } });
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
                new middleware_1.RbacMiddleware(),
                new middleware_1.UsernameAccessMiddleware()
            ];
            this.loadMiddleware(...botifulMiddleware);
            const middlewaresWithInit = Object.values(this.middleware).map((x) => x.initializeClient);
            yield Promise.all(middlewaresWithInit);
            this.log.info(`Middlewares loaded and initialized: [ ${this.listMiddlewares().join(', ')} ]`);
        });
    }
    initActions() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentActions = [];
            for (const action of this.actions.values()) {
                currentActions.push(action.asContext());
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTREO0FBQzVELG9EQUFpQztBQUNqQyxnRUFBb0Q7QUFHcEQsdUNBQWtEO0FBQ2xELHFDQUErRDtBQUMvRCw2Q0FHcUI7QUFDckIscUNBQXFDO0FBQ3JDLDZDQUE4RjtBQUU5RixtQ0FBbUM7QUFFbkMsMkNBUXFCO0FBSHBCLHFHQUFBLGNBQWMsT0FBVztBQUN6QixrR0FBQSxXQUFXLE9BQVE7QUFDbkIscUdBQUEsT0FBTyxPQUFBO0FBRVIscUNBQW1EO0FBQTFDLGdHQUFBLGNBQWMsT0FBUztBQUNoQyxtQ0FBZ0M7QUFBdkIsaUdBQUEsTUFBTSxPQUFBO0FBRWYsTUFBYSxVQUFVO0lBY3RCLFlBQW9CLE9BQTBCO1FBUDdCLFlBQU8sR0FBb0MsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNwRCxlQUFVLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFPM0UsTUFBTSxNQUFNLEdBQUcsSUFBQSwwQkFBaUIsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUEsbUJBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFNLENBQUM7WUFDeEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxp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