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
const common_1 = require("./common");
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
                    new common_1.HelpAction(bot.formatter, bot.emitter, bot.getActions())
                ]);
                yield bot.registerMiddleware(...[
                    new common_1.AdminAccessMiddleware(bot.adminRole, logger),
                    new common_1.RbacMiddleware(bot.emitter, [...bot.actions.values()].map((x) => x.asContext()), logger)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXNEO0FBQ3RELDJDQUE0RjtBQUM1RixvREFBaUM7QUFDakMsZ0VBQW9EO0FBRXBELDZDQVNxQjtBQUNyQix1Q0FBdUQ7QUFDdkQsbUNBQW1DO0FBQ25DLHFDQUE0RTtBQUc1RSxtQ0FBZ0M7QUFBdkIsaUdBQUEsTUFBTSxPQUFBO0FBQ2YsMkNBUXFCO0FBTnBCLG9HQUFBLGFBQWEsT0FBVTtBQUN2QixxR0FBQSxjQUFjLE9BQVc7QUFDekIsa0dBQUEsV0FBVyxPQUFRO0FBQ25CLHFHQUFBLE9BQU8sT0FBQTtBQUlSLHFDQUFtRDtBQUExQyxnR0FBQSxjQUFjLE9BQVM7QUFDaEMsaUNBQWlEO0FBQXhDLGtHQUFBLFNBQVMsT0FBQTtBQUFFLHFHQUFBLFlBQVksT0FBQTtBQUNoQyxpQ0FBdUM7QUFBOUIsc0dBQUEsYUFBYSxPQUFBO0FBc0N0QixNQUFhLFVBQVU7SUEwQ3RCLFlBQ0MsTUFBYyxFQUNkLE1BQWUsRUFDZixTQUFrQixFQUNsQixPQUFnQjtRQTFDRCxjQUFTLEdBQVcsU0FBUyxDQUFBO1FBQzdCLFdBQU0sR0FBVyxHQUFHLENBQUE7UUFDcEIsWUFBTyxHQUFXLFFBQVEsQ0FBQTtRQUd6QixZQUFPLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUE7UUFDcEQsZUFBVSxHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBc0MzRSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksMEJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN2QyxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDbkIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsTUFB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