"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePresence = void 0;
const voice_1 = require("@discordjs/voice");
const stream_1 = require("stream");
class VoicePresence extends stream_1.EventEmitter {
    constructor(guildId, subscription) {
        super();
        this.volume = 60;
        this.guildId = guildId;
        this.subscription = subscription;
        const voice = (0, voice_1.getVoiceConnection)(guildId);
        if (voice == null)
            throw new Error(`Guild ${guildId} doesn't have an active voice connection! Join the user with User.joinInVoice() or construct your own with @discordjs/voice.joinVoiceChannel() before creating a VoicePresences!`);
        this.registerEventForwarders(voice);
    }
    rejoin(channelId, selfDeaf, selfMute) {
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Guild ${this.guildId} doesn't have a voice connection to rejoin`);
        const newJoinConfig = voice.joinConfig;
        if (channelId != null)
            newJoinConfig.channelId = channelId;
        if (selfDeaf != null)
            newJoinConfig.selfDeaf = selfDeaf;
        if (selfMute != null)
            newJoinConfig.selfMute = selfMute;
        voice.rejoin(newJoinConfig);
        this.subscription.player.unpause();
    }
    disconnect(final = true) {
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Guild ${this.guildId} doesn't have a voice connection to disconnect`);
        if (final) {
            this.stopTransmitting();
            voice.destroy();
        }
        else {
            this.pause();
            voice.disconnect();
        }
    }
    isTransmitting() {
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Couldn't determine if this is playing because there is no voice connection for guild ${this.guildId}`);
        return this.subscription.player.state.status === 'playing' && voice.state.status === 'ready';
    }
    pause() {
        this.subscription.player.pause();
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot pause streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(false);
    }
    resume() {
        this.subscription.player.unpause();
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot resume streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(true);
    }
    stopTransmitting() {
        this.streamName = undefined;
        this.subscription.player.stop();
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot stop streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(false);
    }
    startTransmitting(stream, streamName, inputType = voice_1.StreamType.Arbitrary) {
        this.streamName = streamName;
        const resource = (0, voice_1.createAudioResource)(stream, { inputType, inlineVolume: true });
        if (resource.volume == null)
            throw new Error('Internal Error: Expected volume transformer to not be null');
        resource.volume.setVolume(2);
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot start transmitting: there are no voice connections for guild ${this.guildId}. Did you create a voice connection with 'User.joinInVoice()' or manually with '@discordjs/voice.createVoiceConnection()' before calling this?`);
        voice.setSpeaking(true);
        this.subscription.player.play(resource);
    }
    getVolume() {
        return this.volume;
    }
    setVolume(db) {
        var _a;
        this.volume = db;
        const state = this.subscription.player.state;
        if (state.status === voice_1.AudioPlayerStatus.Playing) {
            (_a = state.resource.volume) === null || _a === void 0 ? void 0 : _a.setVolumeDecibels(db);
        }
    }
    registerEventForwarders(voice) {
        voice.on('error', (err) => this.emit('connectionError', err, this.streamName));
        voice.on('debug', (message) => this.emit('playerDebug', message));
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
        this.subscription.player.on('error', () => this.emit('playerError', this.streamName));
        this.subscription.player.on('debug', (message) => this.emit('playerDebug', message));
        this.subscription.player.on('subscribe', (subscription) => this.emit('playerSubscribe', subscription));
        this.subscription.player.on('unsubscribe', (subscription) => this.emit('playerUnsubscribe', subscription));
        this.subscription.player.on('stateChange', (_oldState, newState) => {
            var _a;
            switch (newState.status) {
                case voice_1.AudioPlayerStatus.Idle:
                    this.emit('playerIdle', this.streamName);
                    break;
                case voice_1.AudioPlayerStatus.Buffering:
                    this.emit('playerBuffering', this.streamName);
                    break;
                case voice_1.AudioPlayerStatus.Playing:
                    this.emit('playerStreaming', this.streamName, (_a = newState.resource.volume) === null || _a === void 0 ? void 0 : _a.volumeDecibels);
                    break;
                case voice_1.AudioPlayerStatus.AutoPaused:
                case voice_1.AudioPlayerStatus.Paused:
                    this.emit('playerPaused', this.streamName);
                    break;
            }
        });
    }
}
exports.VoicePresence = VoicePresence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdm9pY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNENBUXlCO0FBQ3pCLG1DQUErQztBQXNHL0MsTUFBYSxhQUFjLFNBQVEscUJBQVk7SUFTOUMsWUFBYSxPQUFlLEVBQUUsWUFBZ0M7UUFDN0QsS0FBSyxFQUFFLENBQUE7UUFIQSxXQUFNLEdBQVcsRUFBRSxDQUFBO1FBSTFCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUEsMEJBQWtCLEVBQUMsT0FBTyxDQUFDLENBQUE7UUFDekMsSUFBSSxLQUFLLElBQUksSUFBSTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxPQUFPLGtMQUFrTCxDQUFDLENBQUE7UUFDdE8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFLTSxNQUFNLENBQUUsU0FBa0IsRUFBRSxRQUFrQixFQUFFLFFBQWtCO1FBQ3hFLE1BQU0sS0FBSyxHQUFHLElBQUEsMEJBQWtCLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzlDLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sNENBQTRDLENBQUMsQ0FBQTtRQUNyRyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFBO1FBQ3RDLElBQUksU0FBUyxJQUFJLElBQUk7WUFBRSxhQUFhLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxRCxJQUFJLFFBQVEsSUFBSSxJQUFJO1lBQUUsYUFBYSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDdkQsSUFBSSxRQUFRLElBQUksSUFBSTtZQUFFLGFBQWEsQ0FBQyxRQUFRLEdBQUcsUUFBUSxD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