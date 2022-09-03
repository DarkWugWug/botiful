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
exports.DiscordBot = exports.VoicePresence = exports.UsageBuilder = exports.Formatter = exports.Store = exports.Command = exports.User = exports.Message = exports.Client = exports.Logger = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const node_persist_1 = __importDefault(require("node-persist"));
const foundation_1 = require("./foundation");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
const helpAction_1 = require("./common/helpAction");
const middleware_1 = require("./common/middleware");
var winston_1 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_1.Logger; } });
var foundation_2 = require("./foundation");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return foundation_2.ArmoredClient; } });
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return foundation_2.ArmoredMessage; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return foundation_2.ArmoredUser; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return foundation_2.Command; } });
var storage_2 = require("./storage");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return storage_2.PrivateStorage; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return utils_2.Formatter; } });
Object.defineProperty(exports, "UsageBuilder", { enumerable: true, get: function () { return utils_2.UsageBuilder; } });
var voice_2 = require("./voice");
Object.defineProperty(exports, "VoicePresence", { enumerable: true, get: function () { return voice_2.VoicePresence; } });
class DiscordBot {
    constructor(client, prefix, adminRole, dataDir) {
        this.adminRole = 'Botiful';
        this.prefix = '!';
        this.dataDir = './data';
        this.actions = new Map();
        this.middleware = new Map();
        this._client = client;
        this.client = new foundation_1.ArmoredClient(client);
        if (prefix != null) {
            if (prefix.length !== 1) {
                throw new Error(`Expected: Botiful prefix to be 1 character long. Got ${prefix.length} characters! Given Prefix: ${prefix}`);
            }
            this.prefix = prefix;
        }
        if (adminRole != null)
            this.adminRole = adminRole;
        if (dataDir != null)
            this.dataDir = dataDir;
        this.formatter = new utils_1.Formatter(this.prefix, this.adminRole, client);
        this.store = node_persist_1.default;
        this.emitter = new events_1.default();
        this._client.on('messageCreate', (msg) => __awaiter(this, void 0, void 0, function* () { return yield this.runAction(msg); }));
        this._client.on('messageUpdate', (oldMsg, newMsg) => __awaiter(this, void 0, void 0, function* () {
            if (oldMsg.content === newMsg.content ||
                (newMsg.embeds.length > 0 && oldMsg.embeds.length === 0)) {
                return;
            }
            yield this.runAction(newMsg);
        }));
    }
    static MakeBotiful(authToken, intents, logger, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new discord_js_1.Client({ intents });
            try {
                yield client.login(authToken);
                const bot = new DiscordBot(client, options === null || options === void 0 ? void 0 : options.prefix, options === null || options === void 0 ? void 0 : options.adminRole, options === null || options === void 0 ? void 0 : options.dataDir);
                yield bot.loadStorage();
                yield bot.registerAction(...[
                    new helpAction_1.HelpAction(bot.formatter, bot.emitter, bot.getActions())
                ]);
                yield bot.registerMiddleware(...[
                    new middleware_1.AdminAccessMiddleware(bot.adminRole, logger),
                    new middleware_1.RbacMiddleware(bot.emitter, [...bot.actions.values()].map((x) => x.asContext()), logger)
                ]);
                bot.registerDefaultSignalHandlers(logger);
                return bot;
            }
            catch (err) {
                throw new Error(`Failed to login to Discord: ${err.message}`, { cause: err });
            }
        });
    }
    getActions() {
        return [...this.actions.values()].map((x) => x.asContext());
    }
    getMiddleware() {
        return [...this.middleware.keys()];
    }
    registerAction(...actionList) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const action of actionList) {
                if (this.actions.has(action.name))
                    throw new Error(`Action with an identical name has already been registered. Names must be unique. Given: ${action.name}`);
                const privateStore = new storage_1.PrivateStorage(this.store, `botiful:${action.name}`);
                if (action.init != null)
                    yield action.init(privateStore, this.client);
                const armoredAction = new foundation_1.ArmoredAction(action, privateStore, this.client);
                this.actions.set(action.name, armoredAction);
                const actionContext = armoredAction.asContext();
                this.emitter.emit('register:action', actionContext);
            }
        });
    }
    registerMiddleware(...middlewareList) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const middleware of middlewareList) {
                if (this.actions.has(middleware.name))
                    throw new Error(`Middleware the an identical name has already been registered! Names must be unique. Given: ${middleware.name}`);
                const privateStore = new storage_1.PrivateStorage(this.store, `botiful:${middleware.name}`);
                if (middleware.init != null)
                    yield middleware.init(privateStore, this.client);
                this.middleware.set(middleware.name, new foundation_1.ArmoredMiddleware(middleware, privateStore, this.client));
                this.emitter.emit('register:middleware', middleware.name);
            }
        });
    }
    runAction(rawMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._client.user == null || rawMessage.author === this._client.user)
                return;
            if (rawMessage.content == null)
                throw new Error('Failed to parse message because the CONTENT was undefined');
            if (rawMessage.author == null)
                throw new Error('Failed to parse message because the AUTHOR was undefined');
            if (!rawMessage.content.startsWith(this.prefix))
                return;
            const command = new foundation_1.Command(rawMessage.content);
            const message = new foundation_1.ArmoredMessage(rawMessage, this.formatter);
            const action = this.actions.get(command.command);
            if (action == null) {
                yield message.reply(`\`:prefix:${command.command}\` is not a command. Use \`:prefix:man ${command.command}\` to see a how to use it or \`:prefix:help\` to see a list of all commands.`);
                return;
            }
            if (!(yield this.isAuthorized(action.asContext(), message))) {
                return;
            }
            yield action.runClient(message);
        });
    }
    registerDefaultSignalHandlers(logger) {
        process.on('SIGINT', () => {
            (0, voice_1.getVoiceConnections)().forEach((connection) => connection.disconnect());
            this._client.destroy();
            if (logger != null) {
                if (this._client.user == null)
                    logger.info('Bot logged out of Discord');
                else
                    logger.info(`${this._client.user.username} has logged out of Discord`);
            }
            process.exit(0);
        });
        if (logger != null) {
            this._client.on('error', (err) => {
                logger.error(`Discord client had error: ${err.message}`);
            });
        }
    }
    loadStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.init({ dir: this.dataDir, expiredInterval: 1 * 60 * 1000 });
        });
    }
    isAuthorized(action, message) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXNEO0FBQ3RELDJDQUE0RjtBQUM1RixvREFBaUM7QUFDakMsZ0VBQW9EO0FBRXBELDZDQVNxQjtBQUNyQix1Q0FBdUQ7QUFDdkQsbUNBQW1DO0FBQ25DLG9EQUFnRDtBQUNoRCxvREFBMkU7QUFHM0UsbUNBQWdDO0FBQXZCLGlHQUFBLE1BQU0sT0FBQTtBQUNmLDJDQVFxQjtBQU5wQixvR0FBQSxhQUFhLE9BQVU7QUFDdkIscUdBQUEsY0FBYyxPQUFXO0FBQ3pCLGtHQUFBLFdBQVcsT0FBUTtBQUNuQixxR0FBQSxPQUFPLE9BQUE7QUFJUixxQ0FBbUQ7QUFBMUMsZ0dBQUEsY0FBYyxPQUFTO0FBQ2hDLGlDQUFpRDtBQUF4QyxrR0FBQSxTQUFTLE9BQUE7QUFBRSxxR0FBQSxZQUFZLE9BQUE7QUFDaEMsaUNBQXVDO0FBQTlCLHNHQUFBLGFBQWEsT0FBQTtBQXNDdEIsTUFBYSxVQUFVO0lBMEN0QixZQUNDLE1BQWMsRUFDZCxNQUFlLEVBQ2YsU0FBa0IsRUFDbEIsT0FBZ0I7UUExQ0QsY0FBUyxHQUFXLFNBQVMsQ0FBQTtRQUM3QixXQUFNLEdBQVcsR0FBRyxDQUFBO1FBQ3BCLFlBQU8sR0FBVyxRQUFRLENBQUE7UUFHekIsWUFBTyxHQUFvQyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ3BELGVBQVUsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQXNDM0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUE7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDBCQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDdkMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO1lBQ25CLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixNQUFNLEVBQUUsQ0FBQyxDQUFBO2FBQzVIO1lBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7U0FDcEI7UUFDRCxJQUFJLFNBQVMsSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDakQsSUFBSSxPQUFPLElBQUksSUFBSTtZQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQzNDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxpQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNuRSxJQUFJLENBQUMsS0FBSyxHQUFHLHNCQUFPLENBQUE7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGdCQUFZLEVBQUUsQ0FBQTtRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBTyxHQUFHLEVBQUUsRUFBRSxnREFBQyxPQUFBLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFBLENBQUMsQ0FBQTtRQUMxRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBTyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekQsSUFDQyxNQUFNLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxPQUFPO2dCQUNqQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFDdkQ7Z0JBQ0QsT0FBTTthQUNOO1lBQ0QsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFDSCxDQUFDO0lBMURNLE1BQU0sQ0FBTyxXQUFXLENBQzlCLFNBQWlCLEVBQ2pCLE9BQWlCLEVBQ2pCLE1BQWUsRUFDZixPQUF3Qjs7WUFFeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUN0QyxJQUFJO2dCQUNILE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUUsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLFNBQVMsRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsT0FBTyxDQUFDLENBQUE7Z0JBQ3pGLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFBO2dCQUN2QixNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRztvQkFDM0IsSUFBSSx1QkFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7aUJBQzVELENBQUMsQ0FBQTtnQkFDRixNQUFNLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHO29CQUMvQixJQUFJLGtDQUFxQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO29CQUNoRCxJQUFJLDJCQUFjLENBQ2pCLEdBQUcsQ0FBQyxPQUFPLEVBQ1gsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUNuRCxNQUFNLENBQ047aUJBQ0QsQ0FBQyxDQUFBO2dCQUNGLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDekMsT0FBTyxHQUFHLENBQUE7YUFDVjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQWdDLEdBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFZLEVBQUUsQ0FBQyxDQUFBO2FBQ2pHO1FBQ0YsQ0FBQztLQUFBO0lBaUNNLFVBQVU7UUFDaEIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDNUQsQ0FBQztJQUVNLGFBQWE7UUFDbkIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFWSxjQUFjLENBQzFCLEdBQUcsVUFBNkI7O1lBRWhDLEtBQUssTUFBTSxNQUFNLElBQUksVUFBVSxFQUFFO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyRkFBMkYsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBQzVKLE1BQU0sWUFBWSxHQUFHLElBQUksd0JBQWMsQ0FDdEMsSUFBSSxDQUFDLEtBQUssRUFDVixXQUFXLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FDeEIsQ0FBQTtnQkFDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSTtvQkFBRSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDckUsTUFBTSxhQUFhLEdBQUcsSUFBSSwwQkFBYSxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUMxRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO2dCQUM1QyxNQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUE7Z0JBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxDQUFBO2FBQ25EO1FBQ0YsQ0FBQztLQUFBO0lBRVksa0JBQWtCLENBQzlCLEdBQUcsY0FBcUM7O1lBRXhDLEtBQUssTUFBTSxVQUFVLElBQUksY0FBYyxFQUFFO2dCQUN4QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7b0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw4RkFBOEYsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBQ3ZLLE1BQU0sWUFBWSxHQUFHLElBQUksd0JBQWMsQ0FDdEMsSUFBSSxDQUFDLEtBQUssRUFDVixXQUFXLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FDNUIsQ0FBQTtnQkFDRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLElBQUksSUFBSTtvQkFBRSxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDN0UsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQ2xCLFVBQVUsQ0FBQyxJQUFJLEVBQ2YsSUFBSSw4QkFBaUIsQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDNUQsQ0FBQTtnQkFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDekQ7UUFDRixDQUFDO0tBQUE7SUFFYSxTQUFTLENBQUUsVUFBb0M7O1lBQzVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUFFLE9BQU07WUFDaEYsSUFBSSxVQUFVLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFBO1lBQzVHLElBQUksVUFBVSxDQUFDLE1BQU0sSUFBSSxJQUFJO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQTtZQUMxRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFBRSxPQUFNO1lBQ3ZELE1BQU0sT0FBTyxHQUFHLElBQUksb0JBQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDL0MsTUFBTSxPQUFPLEdBQUcsSUFBSSwyQkFBYyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDOUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2hELElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDbkIsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUNsQixhQUFhLE9BQU8sQ0FBQyxPQUFPLDBDQUEwQyxPQUFPLENBQUMsT0FBTyw4RUFBOEUsQ0FDbkssQ0FBQTtnQkFDRCxPQUFNO2FBQ047WUFDRCxJQUFJLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBLEVBQUU7Z0JBRTFELE9BQU07YUFDTjtZQUNELE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNoQyxDQUFDO0tBQUE7SUFFTyw2QkFBNkIsQ0FBRSxNQUFlO1FBQ3JELE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUN6QixJQUFBLDJCQUFtQixHQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtZQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ3RCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDbkIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJO29CQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQTs7b0JBQ2xFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLDRCQUE0QixDQUFDLENBQUE7YUFDM0U7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hCLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO1lBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNoQyxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtZQUN6RCxDQUFDLENBQUMsQ0FBQTtTQUNGO0lBQ0YsQ0FBQztJQUVhLFdBQVc7O1lBQ3hCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQzdFLENBQUM7S0FBQTtJQUVhLFlBQVksQ0FDekIsTUFBcUIsRUFDckIsT0FBdUI7O1lBRXZCLEtBQUssTUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtnQkFDNUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFBRSxPQUFPLEtBQUssQ0FBQTtpQkFBRTthQUM3QjtZQUNELE9BQU8sSUFBSSxDQUFBO1FBQ1osQ0FBQztLQUFBO0NBQ0Q7QUF4S0QsZ0NBd0tDIn0=