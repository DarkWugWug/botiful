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
exports.Command = exports.ArmoredClient = exports.ArmoredUser = exports.ArmoredMessage = exports.ArmoredMiddleware = exports.ArmoredAction = void 0;
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
        if (message.content == null || message.author == null) {
            throw new Error("Message doesn't have content or author");
        }
        if (message.member == null)
            this.author = new ArmoredUser(message.author);
        else
            this.author = new ArmoredUser(message.author, message.member);
        const mentionedUser = Object.values(message.mentions.users);
        if (message.mentions.members != null) {
            const mentionedMembers = Object.values(message.mentions.members);
            this.mentionedUsers = [];
            for (let i = 0; i < mentionedUser.length; i++) {
                this.mentionedUsers.push(new ArmoredUser(mentionedUser[i], mentionedMembers[i]));
            }
        }
        else {
            this.mentionedUsers = mentionedUser.map((x) => new ArmoredUser(x));
        }
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
            return this.message.member.roles.cache.some((x) => x.name === role);
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
    asCommand() {
        return new Command(this.content);
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
    getRoles() {
        if (this.member == null)
            throw new Error('User is not a member of this server');
        const roles = [];
        for (const role of this.member.roles.cache.values()) {
            roles.push(role.name);
        }
        return roles;
    }
    hasRole(role) {
        if (this.member == null)
            throw new Error('User is not a member of this server');
        return this.member.roles.cache.has(role);
    }
    giveRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member == null)
                throw new Error('User is not a member of this server');
            yield this.member.roles.add(role);
        });
    }
    removeRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member == null)
                throw new Error('User is not a member of this server');
            yield this.member.roles.remove(role);
        });
    }
}
exports.ArmoredUser = ArmoredUser;
class ArmoredClient {
    constructor(_client) { }
}
exports.ArmoredClient = ArmoredClient;
class Command {
    constructor(stdin) {
        const cmdRegex = /("[^"]*"|\S+)/g;
        const matches = stdin.match(cmdRegex);
        if (matches == null) {
            this.command = '';
            this.args = [];
            return;
        }
        const cmdArgs = matches.map((arg) => /^".*"$/.test(arg) ? arg.substring(1, arg.length - 1) : arg);
        this.command = cmdArgs[0].substring(1);
        this.args = cmdArgs.slice(1);
    }
}
exports.Command = Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3VuZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLDRDQUV5QjtBQUV6Qix1Q0FBdUQ7QUFDdkQsbUNBQTZDO0FBZ0M3QyxNQUFhLGFBQWE7SUFPekIsWUFDQyxZQUF3QixFQUN4QixFQUFnQixFQUNoQixNQUFjLEVBQ2QsTUFBcUI7UUFFckIsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFBO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLE1BQU0sY0FBYyxHQUFHLElBQUksd0JBQWMsQ0FDeEMsRUFBRSxFQUNGLFdBQVcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUN0QixDQUFBO1FBQ0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxjQUFjLENBQUE7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUE7SUFDNUIsQ0FBQztJQUVZLGdCQUFnQjs7WUFDNUIsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2FBQzlEO1lBQ0QsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDbEQ7UUFDRixDQUFDO0tBQUE7SUFFWSxTQUFTLENBQUUsT0FBdUI7O1lBQzlDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FB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