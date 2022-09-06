"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePresence = void 0;
const voice_1 = require("@discordjs/voice");
const stream_1 = require("stream");
class VoicePresence extends stream_1.EventEmitter {
    constructor(guildId, subscription) {
        super();
        this.guildId = guildId;
        const voice = (0, voice_1.getVoiceConnection)(guildId);
        if (voice == null)
            throw new Error(`Guild ${guildId} doesn't have an active voice connection! Join the user with User.joinInVoice() or construct your own with @discordjs/voice.joinVoiceChannel() before calling this!`);
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
        this.subscription = subscription;
        this.subscription.player.on('error', () => this.emit('playerError', this.streamName));
        this.subscription.player.on('debug', (message) => this.emit('playerDebug', message));
        this.subscription.player.on('subscribe', (subscription) => this.emit('playerSubscribe', subscription));
        this.subscription.player.on('unsubscribe', (subscription) => this.emit('playerUnsubscribe', subscription));
        this.subscription.player.on('stateChange', (_oldState, newState) => {
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
    isPlaying() {
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
    startTransmitting(stream, streamName, inputType = voice_1.StreamType.Arbitrary, inlineVolume = true) {
        this.streamName = streamName;
        this.volume = undefined;
        const resource = (0, voice_1.createAudioResource)(stream, { inputType, inlineVolume });
        if (inlineVolume) {
            if (resource.volume == null)
                throw new Error('Expected resource to have volume property. Was it not created with the `inlineVolume: true` option?');
            if (this.volume == null)
                this.volume = 55;
            else
                resource.volume.setVolumeDecibels(this.volume);
        }
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
        this.volume = db;
        this.getResourceVolumeTransformer().setVolumeDecibels(db);
    }
    getResourceVolumeTransformer() {
        const resourceVolume = this.subscription.player.state.resource.volume;
        if (resourceVolume == null)
            throw new Error("This audio resource doesn't have a volume option and setVolume was called. Was it not created with the `inlineVolume: true` option?");
        return resourceVolume;
    }
}
exports.VoicePresence = VoicePresence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdm9pY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNENBUXlCO0FBQ3pCLG1DQUErQztBQXNHL0MsTUFBYSxhQUFjLFNBQVEscUJBQVk7SUFTOUMsWUFBYSxPQUFlLEVBQUUsWUFBZ0M7UUFDN0QsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixNQUFNLEtBQUssR0FBRyxJQUFBLDBCQUFrQixFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3pDLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsT0FBTyxxS0FBcUssQ0FBQyxDQUFBO1FBQ3pOLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUNyRixLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUNqRSxLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMvQyxRQUFRLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLEtBQUssNkJBQXFCLENBQUMsVUFBVTtvQkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFBQyxNQUFLO2dCQUNoRyxLQUFLLDZCQUFxQixDQUFDLFVBQVU7b0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFD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