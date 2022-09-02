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
exports.DiscordBot = exports.Store = exports.VoicePresence = exports.Command = exports.User = exports.Message = exports.Client = exports.Logger = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const node_persist_1 = __importDefault(require("node-persist"));
const actions_1 = require("./actions");
const config_1 = require("./config");
const foundation_1 = require("./foundation");
const logger_1 = require("./logger");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
var winston_1 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_1.Logger; } });
var foundation_2 = require("./foundation");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return foundation_2.ArmoredClient; } });
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return foundation_2.ArmoredMessage; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return foundation_2.ArmoredUser; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return foundation_2.Command; } });
var voice_2 = require("./voice");
Object.defineProperty(exports, "VoicePresence", { enumerable: true, get: function () { return voice_2.VoicePresence; } });
var storage_1 = require("./storage");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return storage_1.PrivateStorage; } });
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
            process.on('SIGINT', () => {
                (0, voice_1.getVoiceConnections)().forEach((connection) => connection.disconnect());
                this.logout()
                    .then(() => process.exit(0))
                    .catch((err) => {
                    this.log.error(err);
                    process.exit(1);
                });
            });
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
                this.log.error(`Failed to login: ${err.message}`);
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
            if (this.actions.has(action.name))
                throw new Error(`Action with name ${action.name} has already been loaded. Names must be unique.`);
            const armoredAction = new foundation_1.ArmoredAction(action, this.store, this.log, new foundation_1.ArmoredClient(this.client));
            this.actions.set(action.name, armoredAction);
            const actionContext = armoredAction.asContext();
            this.emitter.emit('actionLoaded', actionContext);
        }
    }
    loadMiddleware(...middlewareParam) {
        for (const middleware of middlewareParam) {
            if (this.actions.has(middleware.name))
                throw new Error(`Middleware with name ${middleware.name} has already been loaded. Names must be unique.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXNEO0FBQ3RELDJDQUE0RDtBQUM1RCxvREFBaUM7QUFDakMsZ0VBQW9EO0FBRXBELHVDQUFrRDtBQUNsRCxxQ0FBK0Q7QUFDL0QsNkNBR3FCO0FBQ3JCLHFDQUFxQztBQUNyQyw2Q0FBb0U7QUFFcEUsbUNBQW1DO0FBRW5DLG1DQUFnQztBQUF2QixpR0FBQSxNQUFNLE9BQUE7QUFDZiwyQ0FTcUI7QUFQcEIsb0dBQUEsYUFBYSxPQUFVO0FBQ3ZCLHFHQUFBLGNBQWMsT0FBVztBQUN6QixrR0FBQSxXQUFXLE9BQVE7QUFDbkIscUdBQUEsT0FBTyxPQUFBO0FBS1IsaUNBQXVDO0FBQTlCLHNHQUFBLGFBQWEsT0FBQTtBQUN0QixxQ0FBbUQ7QUFBMUMsZ0dBQUEsY0FBYyxPQUFTO0FBRWhDLE1BQWEsVUFBVTtJQWN0QixZQUFvQixPQUEwQjtRQVA3QixZQUFPLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUE7UUFDcEQsZUFBVSxHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBTzNFLE1BQU0sTUFBTSxHQUFHLElBQUEsMEJBQWlCLEVBQUMsT0FBTyxDQUFDLENBQUE7UUFDekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFBLG1CQUFVLEVBQUMsTUFBTSxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQTtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFBO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDO1lBQ3hCLE9B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