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
exports.DiscordBot = exports.Logger = exports.Store = exports.User = exports.Message = void 0;
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
        this.formatter = new utils_1.Formatter(this.prefix, this.adminRole);
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
            const command = new Command(msg.content);
            const message = new foundation_1.ArmoredMessage(msg, this.formatter);
            const isLoaded = Object.keys(this.actions).find((x) => x === command.command);
            if (isLoaded != null) {
                yield message.reply(`\`:prefix:${command.command}\` is not a command. Use \`:prefix:${actions_1.HelpAction.name}\` to see all commands.`);
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
                new actions_1.ManCommand()
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
class Command {
    constructor(stdin) {
        const cmdRegex = /("[^"]*"|\S+)/g;
        const parsedCmd = stdin.match(cmdRegex);
        if (parsedCmd == null) {
            this.command = '';
            this.args = [];
        }
        else {
            const cmdArgs = (parsedCmd.map((arg) => /^".*"$/.test(arg) ? arg.substring(1, arg.length - 2) : arg));
            this.command = cmdArgs[0].substring(1);
            this.args = cmdArgs.slice(1);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTREO0FBQzVELGdFQUFvRDtBQUdwRCx1Q0FBa0Q7QUFDbEQscUNBQStEO0FBQy9ELDZDQUdxQjtBQUNyQixxQ0FBcUM7QUFDckMsNkNBQThGO0FBRTlGLG1DQUFtQztBQUVuQywyQ0FPcUI7QUFGcEIscUdBQUEsY0FBYyxPQUFXO0FBQ3pCLGtHQUFBLFdBQVcsT0FBUTtBQUVwQixxQ0FBbUQ7QUFBMUMsZ0dBQUEsY0FBYyxPQUFTO0FBQ2hDLG1DQUFnQztBQUF2QixpR0FBQSxNQUFNLE9BQUE7QUFFZixNQUFhLFVBQVU7SUFhdEIsWUFBb0IsT0FBMEI7UUFOdEMsWUFBTyxHQUF1QyxFQUFFLENBQUE7UUFDaEQsZUFBVSxHQUEyQyxFQUFFLENBQUE7UUFNOUQsTUFBTSxNQUFNLEdBQUcsSUFBQSwwQkFBaUIsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUEsbUJBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFNLENBQUM7WUFDeEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFB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