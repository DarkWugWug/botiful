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
        this.actions = {};
        this.middleware = {};
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
    }
    listActions() {
        return Object.keys(this.actions);
    }
    listMiddlewares() {
        return Object.keys(this.middleware);
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
            const isLoaded = Object.keys(this.actions).find((x) => x === command.command);
            if (isLoaded == null) {
                let helpCmd = 'help';
                for (const action of Object.values(this.actions)) {
                    if (action instanceof actions_1.HelpAction)
                        helpCmd = action.name;
                }
                yield message.reply(`\`:prefix:${command.command}\` is not a command. Use \`:prefix:${helpCmd}\` to see all commands.`);
                return;
            }
            const action = this.actions[command.command];
            const authorized = yield this.applyMiddleware(action.asContext(), message);
            if (!authorized)
                return;
            yield action.runClient(message);
        });
    }
    loadActions(actionsParam) {
        if (actionsParam instanceof Array) {
            for (const action of actionsParam) {
                this.actions[action.name] = new foundation_1.ArmoredAction(action, this.store, this.log, new foundation_1.ArmoredClient(this.client));
            }
        }
        else {
            this.actions[actionsParam.name] = new foundation_1.ArmoredAction(actionsParam, this.store, this.log, new foundation_1.ArmoredClient(this.client));
        }
        const actionContexts = Object.values(this.actions).map((x) => x.asContext());
        for (const action of Object.values(this.actions)) {
            if (action instanceof actions_1.HelpAction)
                action.replaceActionList(actionContexts);
            else if (action instanceof actions_1.ManCommand)
                action.replaceActionList(actionContexts);
        }
    }
    loadMiddleware(middlewareParam) {
        if (middlewareParam instanceof Array) {
            for (const middleware of middlewareParam) {
                this.middleware[middleware.name] = new foundation_1.ArmoredMiddleware(middleware, this.store, this.log, new foundation_1.ArmoredClient(this.client));
            }
        }
        else {
            this.middleware[middlewareParam.name] = new foundation_1.ArmoredMiddleware(middlewareParam, this.store, this.log, new foundation_1.ArmoredClient(this.client));
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
            this.loadMiddleware(botifulMiddleware);
            const middlewaresWithInit = Object.values(this.middleware).map((x) => x.initializeClient);
            yield Promise.all(middlewaresWithInit);
            this.log.info(`Middlewares loaded and initialized: [ ${this.listMiddlewares().join(', ')} ]`);
        });
    }
    initActions() {
        return __awaiter(this, void 0, void 0, function* () {
            const actionContexts = Object.values(this.actions).map((x) => x.asContext());
            const botifulActions = [
                new actions_1.HelpAction(actionContexts),
                new actions_1.ManCommand(actionContexts)
            ];
            this.loadActions(botifulActions);
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
            for (const name in this.middleware) {
                if (!(yield this.middleware[name].applyClient(action, message))) {
                    return false;
                }
            }
            return true;
        });
    }
}
exports.DiscordBot = DiscordBot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTREO0FBQzVELGdFQUFvRDtBQUdwRCx1Q0FBa0Q7QUFDbEQscUNBQStEO0FBQy9ELDZDQUdxQjtBQUNyQixxQ0FBcUM7QUFDckMsNkNBQThGO0FBRTlGLG1DQUFtQztBQUVuQywyQ0FRcUI7QUFIcEIscUdBQUEsY0FBYyxPQUFXO0FBQ3pCLGtHQUFBLFdBQVcsT0FBUTtBQUNuQixxR0FBQSxPQUFPLE9BQUE7QUFFUixxQ0FBbUQ7QUFBMUMsZ0dBQUEsY0FBYyxPQUFTO0FBQ2hDLG1DQUFnQztBQUF2QixpR0FBQSxNQUFNLE9BQUE7QUFFZixNQUFhLFVBQVU7SUFhdEIsWUFBb0IsT0FBMEI7UUFOdEMsWUFBTyxHQUF1QyxFQUFFLENBQUE7UUFDaEQsZUFBVSxHQUEyQyxFQUFFLENBQUE7UUFNOUQsTUFBTSxNQUFNLEdBQUcsSUFBQSwwQkFBaUIsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUEsbUJBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFNLENBQUM7WUFDeEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFB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