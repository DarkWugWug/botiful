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
        if (typeof message === 'string') {
            message = this.formatter.fmt(message);
        }
        else if (message instanceof discord_js_1.MessagePayload) {
            if (message.options.content != null)
                message.options.content = this.formatter.fmt(message.options.content);
        }
        else if ('content' in message) {
            if (message.content != null)
                message.content = this.formatter.fmt(message.content);
        }
        return message;
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
        return new voice_2.VoicePresence(guildId, subscription);
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
        return __awaiter(this, void 0, void 0, function* () {
            for (const guild of this.client.guilds.cache.values()) {
                yield guild.roles.fetch('guildId');
                if (!guild.roles.cache.some((x) => x.name === role))
                    return false;
            }
            return true;
        });
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