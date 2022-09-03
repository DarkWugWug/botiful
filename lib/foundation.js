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
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const utils_1 = require("./utils");
const voice_2 = require("./voice");
class ArmoredAction {
    constructor(clientAction, store, client) {
        this.name = clientAction.name;
        this.clientAction = clientAction;
        this.store = store;
        this.armoredClient = client;
    }
    initializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientAction.defaults != null) {
                yield this.store._gentlyApplyDefaults(this.clientAction.defaults);
            }
            if (this.clientAction.init != null) {
                yield this.clientAction.init(this.store, this.armoredClient);
            }
        });
    }
    runClient(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clientAction.run(message, this.store);
        });
    }
    asContext() {
        return {
            name: this.clientAction.name,
            description: this.clientAction.description,
            usage: this.clientAction.usage,
            admin: this.clientAction.admin,
            roles: this.clientAction.roles,
            users: this.clientAction.users
        };
    }
}
exports.ArmoredAction = ArmoredAction;
class ArmoredMiddleware {
    constructor(clientMiddleware, store, client) {
        this.name = clientMiddleware.name;
        this.clientMiddleware = clientMiddleware;
        this.store = store;
        this.discordClient = client;
    }
    initializeClient() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.clientMiddleware.defaults != null) {
                yield this.store._gentlyApplyDefaults(this.clientMiddleware.defaults);
            }
            if (this.clientMiddleware.init != null) {
                yield this.clientMiddleware.init(this.store, this.discordClient);
            }
        });
    }
    applyClient(action, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.clientMiddleware.apply(action, message, this.store);
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
        this.mentionedUsers = [...message.mentions.users.values()]
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
        this.channelId = message.channelId;
        this.message = message;
        this.formatter = formatter;
    }
    respond(x) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = this.message.channel;
            yield (0, utils_1.doTyping)(channel, 500);
            yield channel.send(this.formatMessage(x));
        });
    }
    reply(x) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, utils_1.doTyping)(this.message.channel, 500);
            yield this.message.reply(this.formatMessage(x));
        });
    }
    asCommand() {
        return new Command(this.content);
    }
    formatMessage(message) {
        const maybeOptions = message;
        if (typeof message === 'string') {
            return this.formatter.fmt(message);
        }
        else if (message instanceof discord_js_1.MessagePayload) {
            if (message.options.content != null) {
                message.options.content = this.formatter.fmt(message.options.content);
            }
            return message;
        }
        else if (maybeOptions.content != null) {
            maybeOptions.content = this.formatter.fmt(maybeOptions.content);
            return maybeOptions;
        }
        throw new Error('Tried to format something that wasn\'t an expected message type');
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
            throw new Error(`User ${this.tag} is not a member of this server`);
        return [...this.member.roles.cache.values()].map((x) => x.name);
    }
    hasRole(role) {
        if (this.member == null)
            throw new Error(`User ${this.tag} is not a member of this server`);
        const actualRole = this.member.guild.roles.cache.find((x) => x.name === role);
        if (actualRole == null)
            throw new Error(`Role with name ${role} doesn't exist`);
        return this.member.roles.cache.has(actualRole.id);
    }
    hasAnyRole(roles) {
        if (this.member == null)
            throw new Error(`User ${this.tag} is not a member of this server`);
        const actualRoles = this.member.guild.roles.cache.filter((x) => roles.some((y) => y === x.name));
        if (actualRoles == null)
            throw new Error(`No role exists with a name from [ ${roles.join(', ')} ]`);
        return this.member.roles.cache.hasAny(...actualRoles.keys());
    }
    giveRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member == null)
                throw new Error(`User ${this.tag} is not a member of this server`);
            const actualRole = this.member.guild.roles.cache.find((x) => x.name === role);
            if (actualRole == null)
                throw new Error(`Role with name ${role} doesn't exist`);
            yield this.member.roles.add(actualRole.id);
        });
    }
    removeRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member == null)
                throw new Error('User is not a member of this server');
            const actualRole = this.member.guild.roles.cache.find((x) => x.name === role);
            if (actualRole == null)
                throw new Error('Role doesn\'t exists');
            yield this.member.roles.remove(actualRole);
        });
    }
    joinInVoice(selfDeaf = true, selfMute = false) {
        if (this.member == null)
            throw new Error(`${this.tag} isn't a member of this server`);
        if (this.member.voice.channel == null ||
            this.member.voice.channelId == null ||
            this.member.voice.channel.guildId == null)
            throw new Error(`${this.tag} isn't in a voice channel`);
        const guildId = this.member.voice.channel.guildId;
        const player = (0, voice_1.createAudioPlayer)();
        const voiceConnection = (0, voice_1.joinVoiceChannel)({
            guildId,
            channelId: this.member.voice.channelId,
            adapterCreator: this.member.voice.channel.guild.voiceAdapterCreator,
            selfDeaf,
            selfMute
        });
        const subscription = voiceConnection.subscribe(player);
        if (subscription == null)
            throw new Error('When creating the voice connection, failed to subscribe to the audio player');
        return new voice_2.VoicePresence(guildId, player);
    }
    isInVoiceChannel() {
        if (this.member == null)
            throw new Error(`${this.tag} isn't a member of this server`);
        return this.member.voice.channel != null;
    }
}
exports.ArmoredUser = ArmoredUser;
class ArmoredClient {
    constructor(client) {
        this.client = client;
    }
    guildsHaveRole(role) {
        for (const guild of this.client.guilds.cache.values()) {
            if (!guild.roles.cache.some((x) => x.name === role))
                return false;
        }
        return true;
    }
    createRoleInGuilds(name, color, mentionable) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([...this.client.guilds.cache.values()]
                .filter((guild) => !guild.roles.cache.some((role) => role.name === name))
                .map((guild) => __awaiter(this, void 0, void 0, function* () { return yield guild.roles.create({ name, color, mentionable, reason: 'platform-botiful' }); })));
        });
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3VuZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJDQVVtQjtBQUNuQiw0Q0FHeUI7QUFFekIsbUNBQTJEO0FBQzNELG1DQUF1QztBQXNCdkMsTUFBYSxhQUFhO0lBTXpCLFlBQ0MsWUFBd0IsRUFDeEIsS0FBd0IsRUFDeEIsTUFBcUI7UUFFckIsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFBO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFBO0lBQzVCLENBQUM7SUFFWSxnQkFBZ0I7O1lBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN2QyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUNqRTtZQUNELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNuQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO2FBQzVEO1FBQ0YsQ0FBQztLQUFBO0lBRVksU0FBUyxDQUFFLE9BQXVCOztZQUM5QyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDakQsQ0FBQztLQUFBO0lBRU0sU0FBUztRQUNmLE9BQU87WUFDTixJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJO1lBQzVCLFdBQVcsRUFBRSxJQUFJLENB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