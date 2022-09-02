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
exports.DiscordBot = exports.UsageBuilder = exports.Formatter = exports.Store = exports.VoicePresence = exports.Command = exports.User = exports.Message = exports.Client = exports.Logger = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const node_persist_1 = __importDefault(require("node-persist"));
const foundation_1 = require("./foundation");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
const actions_1 = require("./common/actions");
const middleware_1 = require("./common/middleware");
var winston_1 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_1.Logger; } });
var foundation_2 = require("./foundation");
Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return foundation_2.ArmoredClient; } });
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return foundation_2.ArmoredMessage; } });
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return foundation_2.ArmoredUser; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return foundation_2.Command; } });
var voice_2 = require("./voice");
Object.defineProperty(exports, "VoicePresence", { enumerable: true, get: function () { return voice_2.VoicePresence; } });
var storage_2 = require("./storage");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return storage_2.PrivateStorage; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return utils_2.Formatter; } });
Object.defineProperty(exports, "UsageBuilder", { enumerable: true, get: function () { return utils_2.UsageBuilder; } });
const DEFAULT_DATA_DIR = './data';
class DiscordBot {
    constructor(client, prefix) {
        this.adminRole = 'Botiful';
        this.prefix = '!';
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
                const bot = new DiscordBot(client);
                if ((options === null || options === void 0 ? void 0 : options.dataDir) != null)
                    yield bot.loadStorage(options.dataDir);
                else
                    yield bot.loadStorage(DEFAULT_DATA_DIR);
                yield bot.registerAction(...[
                    new actions_1.HelpAction(bot.formatter, bot.emitter, bot.getActions())
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
                this.emitter.emit('actionLoaded', actionContext);
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
    loadStorage(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.init({ dir, expiredInterval: 1 * 60 * 1000 });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXNEO0FBQ3RELDJDQUE0RjtBQUM1RixvREFBaUM7QUFDakMsZ0VBQW9EO0FBRXBELDZDQUdxQjtBQUNyQix1Q0FBdUQ7QUFDdkQsbUNBQW1DO0FBQ25DLDhDQUE2QztBQUM3QyxvREFBMkU7QUFFM0UsbUNBQWdDO0FBQXZCLGlHQUFBLE1BQU0sT0FBQTtBQUNmLDJDQVNxQjtBQVBwQixvR0FBQSxhQUFhLE9BQVU7QUFDdkIscUdBQUEsY0FBYyxPQUFXO0FBQ3pCLGtHQUFBLFdBQVcsT0FBUTtBQUNuQixxR0FBQSxPQUFPLE9BQUE7QUFLUixpQ0FBdUM7QUFBOUIsc0dBQUEsYUFBYSxPQUFBO0FBQ3RCLHFDQUFtRDtBQUExQyxnR0FBQSxjQUFjLE9BQVM7QUFFaEMsaUNBQWlEO0FBQXhDLGtHQUFBLFNBQVMsT0FBQTtBQUFFLHFHQUFBLFlBQVksT0FBQTtBQUVoQyxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQWFqQyxNQUFhLFVBQVU7SUEwQ3RCLFlBQ0MsTUFBYyxFQUNkLE1BQWU7UUEzQ0EsY0FBUyxHQUFXLFNBQVMsQ0FBQTtRQUM3QixXQUFNLEdBQVcsR0FBRyxDQUFBO1FBS25CLFlBQU8sR0FBb0MsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNwRCxlQUFVLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUE7UUFzQzNFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSwwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3ZDLElBQUksTUFBTSxJQUFJLElBQUksRUFBRTtZQUNuQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHdEQUF3RCxNQUFNLENB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