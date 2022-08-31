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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQTREO0FBQzVELGdFQUFvRDtBQUdwRCx1Q0FBa0Q7QUFDbEQscUNBQStEO0FBQy9ELDZDQUdxQjtBQUNyQixxQ0FBcUM7QUFDckMsNkNBQThGO0FBRTlGLG1DQUFtQztBQUVuQywyQ0FPcUI7QUFGcEIscUdBQUEsY0FBYyxPQUFXO0FBQ3pCLGtHQUFBLFdBQVcsT0FBUTtBQUVwQixxQ0FBbUQ7QUFBMUMsZ0dBQUEsY0FBYyxPQUFTO0FBQ2hDLG1DQUFnQztBQUF2QixpR0FBQSxNQUFNLE9BQUE7QUFFZixNQUFhLFVBQVU7SUFhdEIsWUFBb0IsT0FBMEI7UUFOdEMsWUFBTyxHQUF1QyxFQUFFLENBQUE7UUFDaEQsZUFBVSxHQUEyQyxFQUFFLENBQUE7UUFNOUQsTUFBTSxNQUFNLEdBQUcsSUFBQSwwQkFBaUIsRUFBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUEsbUJBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLG1CQUFNLENBQUM7WUFDeEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3ZCLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDeEUsSUFBSSxDQUFDLEtBQUssR0FBRyxzQkFBTyxDQUFBO0lBQ3JCLENBQUM7SUFFTSxXQUFXO1FBQ2pCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDakMsQ0FBQztJQUVNLGVBQWU7UUFDckIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRVksTUFBTTs7WUFDbEIsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUE7UUFDN0MsQ0FBQztLQUFBO0lBRVksS0FBSzs7WUFDakIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7WUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQTtZQUN4QyxJQUFJO2dCQUNILE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTtvQkFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLDZCQUE2QixDQUFDLENBQUE7aUJBQ3hFO3FCQUFNO29CQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUE7aUJBQ3ZDO2FBQ0Q7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7YUFDbEU7UUFDRixDQUFDO0tBQUE7SUFFWSxTQUFTLENBQUUsR0FBNkI7O1lBQ3BELElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FDYixvREFBb0QsQ0FDcEQsQ0FBQTtnQkFDRCxPQUFNO2FBQ047WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFNO1lBRTNFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUFFLE9BQU07WUFDaEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3hDLE1BQU0sT0FBTyxHQUFHLElBQUksMkJBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3ZELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FDOUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsT0FBTyxDQUM1QixDQUFBO1lBQ0QsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUNyQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2xCLGFBQWEsT0FBTyxDQUFDLE9BQU8sc0NBQXNDLG9CQUFVLENBQUMsSUFBSSx5QkFBeUIsQ0FDMUcsQ0FBQTthQUNEO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDNUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUM1QyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQ2xCLE9BQU8sQ0FDUCxDQUFBO1lBQ0QsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTTtZQUN2QixNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDaEMsQ0FBQztLQUFBO0lBRU0sV0FBVyxDQUNqQixZQUE0QztRQUU1QyxJQUFJLFlBQVksWUFBWSxLQUFLLEVBQUU7WUFDbEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxZQUFZLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksMEJBQWEsQ0FDNUMsTUFBTSxFQUNOLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLDBCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUM5QixDQUFBO2FBQ0Q7U0FDRDthQUFNO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSwwQkFBYSxDQUNsRCxZQUFZLEVBQ1osSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsR0FBRyxFQUNSLElBQUksMEJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQzlCLENBQUE7U0FDRDtJQUNGLENBQUM7SUFFTSxjQUFjLENBQ3BCLGVBQXVEO1FBRXZELElBQUksZUFBZSxZQUFZLEtBQUssRUFBRTtZQUNyQyxLQUFLLE1BQU0sVUFBVSxJQUFJLGVBQWUsRUFBRTtnQkFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSw4QkFBaUIsQ0FDdkQsVUFBVSxFQUNWLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLDBCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUM5QixDQUFBO2FBQ0Q7U0FDRDthQUFNO1lBQ04sSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSw4QkFBaUIsQ0FDNUQsZUFBZSxFQUNmLElBQUksQ0FBQyxLQUFLLEVBQ1YsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLDBCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUM5QixDQUFBO1NBQ0Q7SUFDRixDQUFDO0lBRWEsV0FBVzs7WUFDeEIsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDckIsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSTthQUM5QixDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQ3hDLENBQUM7S0FBQTtJQUVhLGVBQWU7O1lBQzVCLE1BQU0saUJBQWlCLEdBQUc7Z0JBQ3pCLElBQUksa0NBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDekMsSUFBSSwyQkFBYyxFQUFFO2dCQUNwQixJQUFJLHFDQUF3QixFQUFFO2FBQzlCLENBQUE7WUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDdEMsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQzdELENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQ3pCLENBQUE7WUFDRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUN0QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FDWix5Q0FBeUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FDbkUsSUFBSSxDQUNKLElBQUksQ0FDTCxDQUFBO1FBQ0YsQ0FBQztLQUFBO0lBRWEsV0FBVzs7WUFDeEIsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDNUQsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUNiLENBQUE7WUFDRCxNQUFNLGNBQWMsR0FBRztnQkFDdEIsSUFBSSxvQkFBVSxDQUFDLGNBQWMsQ0FBQztnQkFDOUIsSUFBSSxvQkFBVSxFQUFFO2FBQ2hCLENBQUE7WUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQ2hDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FDbEQsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FDekIsQ0FBQTtZQUNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FDWixxQ0FBcUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FDM0QsSUFBSSxDQUNKLElBQUksQ0FDTCxDQUFBO1FBQ0YsQ0FBQztLQUFBO0lBRWEsSUFBSTs7WUFDakIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7WUFDeEIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQU8sR0FBRyxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBQSxDQUFDLENBQUE7WUFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQU8sTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN4RCxJQUNDLE1BQU0sQ0FBQyxPQUFPLEtBQUssTUFBTSxDQUFDLE9BQU87b0JBQ2pDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUN2RDtvQkFDRCxPQUFNO2lCQUNOO2dCQUNELE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUM3QixDQUFDLENBQUEsQ0FBQyxDQUFBO1FBQ0gsQ0FBQztLQUFBO0lBRWEsZUFBZSxDQUM1QixNQUFxQixFQUNyQixPQUF1Qjs7WUFFdkIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO29CQUFFLE9BQU8sS0FBSyxDQUFBO2lCQUFFO2FBQ2pGO1lBQ0QsT0FBTyxJQUFJLENBQUE7UUFDWixDQUFDO0tBQUE7Q0FDRDtBQXRNRCxnQ0FzTUM7QUFFRCxNQUFNLE9BQU87SUFJWixZQUFhLEtBQWE7UUFDekIsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUE7UUFDakMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN2QyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7WUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7U0FDZDthQUFNO1lBQ04sTUFBTSxPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDdEMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUMzRCxDQUFDLENBQUE7WUFDRixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQzVCO0lBQ0YsQ0FBQztDQUNEIn0=