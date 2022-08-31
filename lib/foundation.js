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
        console.log(`Mentioned Users: [ ${Object.values(message.mentions.users).join(', ')} ]`);
        this.mentionedUsers = Object.values(message.mentions.users)
            .map((x) => {
            if (message.mentions.members == null)
                return new ArmoredUser(x);
            else if (message.mentions.members.get(x.id) != null)
                return new ArmoredUser(x, message.mentions.members.get(x.id));
            else {
                return new ArmoredUser(x);
            }
        });
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
    asCommand() {
        return new Command(this.content);
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
        return Object.values(this.member.roles.cache).map((x) => x.name);
    }
    hasRole(role) {
        if (this.member == null)
            throw new Error('User is not a member of this server');
        return this.member.roles.cache.some((x) => x.name === role);
    }
    hasAnyRole(roles) {
        if (this.member == null)
            throw new Error('User is not a member of this server');
        return this.member.roles.cache.some((x) => roles.some((y) => x.name === y));
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
    tryJoinInVoice(selfDeaf = true, selfMute = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member == null)
                throw new Error(`${this.tag} isn't a member of this server`);
            if (this.member.voice.channel == null ||
                this.member.voice.channelId == null)
                throw new Error(`${this.tag} isn't in a voice channel`);
            const memberVoice = this.member.voice;
            const player = (0, voice_1.createAudioPlayer)();
            const voiceConnection = (0, voice_1.joinVoiceChannel)({
                guildId: this.member.guild.id,
                channelId: memberVoice.id,
                adapterCreator: this.member.guild.voiceAdapterCreator,
                selfDeaf,
                selfMute
            });
            return new voice_1.PlayerSubscription(voiceConnection, player);
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