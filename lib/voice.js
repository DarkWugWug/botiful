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
    startTransmitting(stream, streamName, format = voice_1.StreamType.Arbitrary) {
        this.streamName = streamName;
        const resource = (0, voice_1.createAudioResource)(stream, { inputType: format, inlineVolume: true });
        if (resource.volume == null)
            throw new Error('Expected resource to have volume property. Was it not created with the `inlineVolume: true` option?');
        if (this.volume == null)
            this.volume = 55;
        else
            resource.volume.setVolumeDecibels(this.volume);
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot start streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdm9pY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNENBUXlCO0FBQ3pCLG1DQUErQztBQW1FL0MsTUFBYSxhQUFjLFNBQVEscUJBQVk7SUFTOUMsWUFBYSxPQUFlLEVBQUUsWUFBZ0M7UUFDN0QsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixNQUFNLEtBQUssR0FBRyxJQUFBLDBCQUFrQixFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3pDLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsT0FBTyxxS0FBcUssQ0FBQyxDQUFBO1FBQ3pOLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUNyRixLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMvQyxRQUFRLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLEtBQUssNkJBQXFCLENBQUMsVUFBVTtvQkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFBQyxNQUFLO2dCQUNoRyxLQUFLLDZCQUFxQixDQUFDLFVBQVU7b0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQUMsTUFBSztnQkFDN0YsS0FBSyw2QkFBcUIsQ0FBQyxZQUFZO29CQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29C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