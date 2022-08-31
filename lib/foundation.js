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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmoredClient = exports.ArmoredUser = exports.ArmoredMessage = exports.ArmoredMiddleware = exports.ArmoredAction = void 0;
const voice_1 = require("@discordjs/voice");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
class ArmoredAction {
    constructor(clientAction, db, logger, client) {
        this.name = clientAction.name;
        this.clientAction = clientAction;
        const privateStorage = new storage_1.PrivateStorage(db, `botiful:${this.name}`);
        this.db = privateStorage;
        this.logger = logger;
        this.discordClient = client;
    }
    initializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientAction.defaults != null) {
                yield this.db._gentlyApplyDefaults(this.clientAction.defaults);
            }
            if (this.clientAction.init != null) {
                yield this.clientAction.init(this.db, this.logger);
            }
        });
    }
    runClient(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clientAction.run(message, this.db, this.logger);
        });
    }
    asContext() {
        return {
            name: this.clientAction.name,
            description: this.clientAction.description,
            man: this.clientAction.man,
            admin: this.clientAction.admin,
            roles: this.clientAction.roles,
            users: this.clientAction.users
        };
    }
}
exports.ArmoredAction = ArmoredAction;
class ArmoredMiddleware {
    constructor(clientMiddleware, db, logger, client) {
        this.name = clientMiddleware.name;
        this.clientMiddleware = clientMiddleware;
        const privateStorage = new storage_1.PrivateStorage(db, `botiful:${this.name}`);
        this.db = privateStorage;
        this.logger = logger;
        this.discordClient = client;
    }
    initializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientMiddleware.defaults != null) {
                yield this.db._gentlyApplyDefaults(this.clientMiddleware.defaults);
            }
            if (this.clientMiddleware.init != null) {
                yield this.clientMiddleware.init(this.db, this.logger);
            }
        });
    }
    applyClient(action, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientMiddleware.apply(action, message, this.db, this.logger);
        });
    }
}
exports.ArmoredMiddleware = ArmoredMiddleware;
class ArmoredMessage {
    constructor(message, formatter) {
        var _a;
        if (message.content === null || message.author == null) {
            throw new Error("Message doesn't have content or author");
        }
        this.author = new ArmoredUser(message.author);
        this.mentionedUsers = message.mentions.users.map((x) => new ArmoredUser(x));
        this.guildId = message.guildId === null ? undefined : message.guildId;
        this.fromGuildOwner = ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.ownerId) === this.author.id;
        this.content = message.content;
        this.message = message;
        this.formatter = formatter;
    }
    respond(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = this.message.channel;
            yield (0, utils_1.doTyping)(channel, 500);
            yield channel.send(this.formatter.fmt(response));
        });
    }
    reply(response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_1.doTyping)(this.message.channel, 500);
            yield this.message.reply(this.formatter.fmt(response));
        });
    }
    tryJoinAuthorInVoice(selfDeaf = true, selfMute = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.message.member == null) {
                throw yield this.dispatchError(`${this.author.username} isn't a member of this server`);
            }
            if (this.message.member.voice.channel == null ||
                this.message.member.voice.channelId == null) {
                throw yield this.dispatchError(`${this.author.username} isn't in a voice channel`);
            }
            if (this.message.guild == null || this.guildId == null) {
                throw yield this.dispatchError("Hmmm... you didn't send this in a server. I can only join server voice chats.");
            }
            const memberVoice = this.message.member.voice;
            const player = (0, voice_1.createAudioPlayer)();
            try {
                const voiceConnection = (0, voice_1.joinVoiceChannel)({
                    guildId: this.guildId,
                    channelId: memberVoice.id,
                    adapterCreator: this.message.guild.voiceAdapterCreator,
                    selfDeaf,
                    selfMute
                });
                return new voice_1.PlayerSubscription(voiceConnection, player);
            }
            catch (err) {
                throw yield this.dispatchError(`I was looking for '${this.message.member.voice.channel.name}', but couldn't find it. Can :adminRole: help us?`);
            }
        });
    }
    authorHasRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.message.member == null) {
                throw yield this.dispatchError(`${this.author.username} isn't a member of this server`);
            }
            return this.message.member.roles.cache.has(role);
        });
    }
    authorHasAnyRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.message.member == null) {
                throw yield this.dispatchError(`${this.author.username} isn't a member of this server`);
            }
            return this.message.member.roles.cache.hasAny(...role);
        });
    }
    dispatchError(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.reply(text);
            return new Error(text);
        });
    }
}
exports.ArmoredMessage = ArmoredMessage;
class ArmoredUser {
    constructor(user, member) {
        this.username = user.username;
        this.id = user.id;
        this.tag = user.tag;
        this.member = member;
    }
    hasRole(role) {
        if (this.member == null)
            return false;
        return this.member.roles.cache.has(role);
    }
}
exports.ArmoredUser = ArmoredUser;
class ArmoredClient {
    constructor(_client) { }
}
exports.ArmoredClient = ArmoredClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3VuZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLDRDQUV5QjtBQUV6Qix1Q0FBdUQ7QUFDdkQsbUNBQTZDO0FBZ0M3QyxNQUFhLGFBQWE7SUFPekIsWUFDQyxZQUF3QixFQUN4QixFQUFnQixFQUNoQixNQUFjLEVBQ2QsTUFBcUI7UUFFckIsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFBO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUksd0JBQWMsQ0FDeEMsRUFBRSxFQUNGLFdBQVcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUN0QixDQUFBO1FBQ0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxjQUFjLENBQUE7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUE7SUFDNUIsQ0FBQztJQUVZLGdCQUFnQjs7WUFDNUIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQzlEO1lBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDbEQ7UUFDRixDQUFDO0tBQUE7SUFFWSxTQUFTLENBQUUsT0FBdUI7O1lBQzlDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FB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