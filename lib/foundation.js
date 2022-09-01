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
exports.VoicePresence = exports.Command = exports.ArmoredClient = exports.ArmoredUser = exports.ArmoredMessage = exports.ArmoredMiddleware = exports.ArmoredAction = void 0;
const voice_1 = require("@discordjs/voice");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
const stream_1 = require("stream");
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
                yield this.clientAction.init(this.db, this.logger, this.discordClient);
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
                yield this.clientMiddleware.init(this.db, this.logger, this.discordClient);
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
        }).on('error', (err) => console.error(`Failed to join user! ${err.message}`));
        const subscription = voiceConnection.subscribe(player);
        if (subscription == null)
            throw new Error('When creating the voice connection, failed to subscribe to the audio player');
        return new VoicePresence(subscription);
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
class VoicePresence extends stream_1.EventEmitter {
    constructor(subscription) {
        super();
        this.subscription = subscription;
        const voice = this.subscription.connection;
        voice.on('error', (err) => this.emit('connectionError', err, this.streamName));
        voice.on('stateChange', (_oldState, newState) => {
            switch (newState.status) {
                case voice_1.VoiceConnectionStatus.Signalling:
                    this.emit('connectionSignalling', this.streamName);
                    break;
                case voice_1.VoiceConnectionStatus.Connecting:
                    this.emit('connectionJoining', this.streamName);
                    break;
                case voice_1.VoiceConnectionStatus.Disconnected:
                    this.emit('connectionStandby', this.streamName);
                    break;
                case voice_1.VoiceConnectionStatus.Ready:
                    this.emit('connectionReady', this.streamName);
                    break;
                case voice_1.VoiceConnectionStatus.Destroyed:
                    this.emit('connectionDestroyed', this.streamName);
                    break;
            }
        });
        const player = this.subscription.player;
        player.on('error', () => this.emit('playerError', this.streamName));
        player.on('stateChange', (_oldState, newState) => {
            switch (newState.status) {
                case voice_1.AudioPlayerStatus.Idle:
                    this.emit('playerIdle', this.streamName);
                    break;
                case voice_1.AudioPlayerStatus.Buffering:
                    this.emit('playerBuffering', this.streamName);
                    break;
                case voice_1.AudioPlayerStatus.Playing:
                    this.emit('playerStreaming', this.streamName);
                    break;
                case voice_1.AudioPlayerStatus.AutoPaused:
                case voice_1.AudioPlayerStatus.Paused:
                    this.emit('playerPaused', this.streamName);
                    break;
            }
        });
    }
    destroy() {
        this.subscription.player.stop();
        this.subscription.connection.destroy();
    }
    rejoin() {
        this.subscription.connection.rejoin();
        this.subscription.player.unpause();
    }
    disconnect() {
        this.subscription.player.pause();
        this.subscription.connection.disconnect();
    }
    isPlaying() {
        return this.subscription.player.state.status !== 'idle';
    }
    pause() {
        const withPadding = true;
        this.subscription.player.pause(withPadding);
    }
    resume() {
        this.subscription.player.unpause();
    }
    stopTransmitting() {
        this.streamName = undefined;
        this.subscription.player.stop();
    }
    startTransmitting(stream, streamName, format = voice_1.StreamType.WebmOpus) {
        this.streamName = streamName;
        const resource = (0, voice_1.createAudioResource)(stream, { inputType: format, inlineVolume: true });
        if (resource.volume == null)
            throw new Error('Expected resource to have volume property. Was it not created with the `inlineVolume: true` option?');
        if (this.volume != null)
            resource.volume.setVolumeDecibels(this.volume);
        this.subscription.player.play(resource);
    }
    getVolume() {
        if (this.volume != null)
            return this.volume;
        if (this.subscription.player.state.status === 'playing') {
            return this.getResourceVolumeTransformer().volumeDecibels;
        }
        throw new Error("Couldn't find volume for VoicePresence and nothing was playing. Only call if set or playing something!");
    }
    setVolume(db) {
        if (db < 0 || db > 1)
            throw new Error(`Invalid volume setting: ${db}. Must be a number from 0.0 to 1.0`);
        const state = this.subscription.player.state;
        this.volume = db;
        if (state.status === 'playing') {
            this.setResourceVolume(db);
        }
    }
    getResourceVolumeTransformer() {
        const resourceVolume = this.subscription.player.state.resource.volume;
        if (resourceVolume == null)
            throw new Error("This audio resource doesn't have a volume option and setVolume was called. Was it not created with the `inlineVolume: true` option?");
        return resourceVolume;
    }
    setResourceVolume(db) {
        this.getResourceVolumeTransformer().setVolumeDecibels(db);
    }
}
exports.VoicePresence = VoicePresence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3VuZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVdBLDRDQVV5QjtBQUN6Qix1Q0FBdUQ7QUFDdkQsbUNBQTZDO0FBQzdDLG1DQUErQztBQWlDL0MsTUFBYSxhQUFhO0lBT3pCLFlBQ0MsWUFBd0IsRUFDeEIsRUFBZ0IsRUFDaEIsTUFBYyxFQUNkLE1BQXFCO1FBRXJCLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQTtRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtRQUNoQyxNQUFNLGNBQWMsR0FBRyxJQUFJLHdCQUFjLENBQ3hDLEVBQUUsRUFDRixXQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FDdEIsQ0FBQTtRQUNELElBQUksQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFBO0lBQzVCLENBQUM7SUFFWSxnQkFBZ0I7O1lBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUN2QyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUM5RDtZQUNELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUNuQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7YUFDdEU7UUFDRixDQUFDO0tBQUE7SUFFWSxTQUFTLENBQUUsT0FBdUI7O1lBQzlDLE1BQU0sSUFBSSxDQUFDLFlBQVks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