"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePresence = void 0;
const voice_1 = require("@discordjs/voice");
const stream_1 = require("stream");
class VoicePresence extends stream_1.EventEmitter {
    constructor(guildId, player) {
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
        this.stream = player;
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
        this.stream.unpause();
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
        return this.stream.state.status === 'playing' && voice.state.status === 'ready';
    }
    pause() {
        this.stream.pause();
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot pause streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(false);
    }
    resume() {
        this.stream.unpause();
        const voice = (0, voice_1.getVoiceConnection)(this.guildId);
        if (voice == null)
            throw new Error(`Cannot resume streaming because there is no voice connection for guild ${this.guildId}`);
        voice.setSpeaking(true);
    }
    stopTransmitting() {
        this.streamName = undefined;
        this.stream.stop();
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
        this.stream.play(resource);
    }
    getVolume() {
        if (this.volume != null)
            return this.volume;
        if (this.stream.state.status === 'playing') {
            return this.getResourceVolumeTransformer().volumeDecibels;
        }
        throw new Error("Couldn't find volume for VoicePresence and nothing was playing. Only call if set or playing something!");
    }
    setVolume(db) {
        if (db < 0 || db > 1)
            throw new Error(`Invalid volume setting: ${db}. Must be a number from 0.0 to 1.0`);
        const state = this.stream.state;
        this.volume = db;
        if (state.status === 'playing') {
            this.setResourceVolume(db);
        }
    }
    getResourceVolumeTransformer() {
        const resourceVolume = this.stream.state.resource.volume;
        if (resourceVolume == null)
            throw new Error("This audio resource doesn't have a volume option and setVolume was called. Was it not created with the `inlineVolume: true` option?");
        return resourceVolume;
    }
    setResourceVolume(db) {
        this.getResourceVolumeTransformer().setVolumeDecibels(db);
    }
}
exports.VoicePresence = VoicePresence;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm9pY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdm9pY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNENBUXlCO0FBQ3pCLG1DQUErQztBQW1FL0MsTUFBYSxhQUFjLFNBQVEscUJBQVk7SUFTOUMsWUFBYSxPQUFlLEVBQUUsTUFBbUI7UUFDaEQsS0FBSyxFQUFFLENBQUE7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixNQUFNLEtBQUssR0FBRyxJQUFBLDBCQUFrQixFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3pDLElBQUksS0FBSyxJQUFJLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsT0FBTyxxS0FBcUssQ0FBQyxDQUFBO1FBQ3pOLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtRQUNyRixLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtZQUMvQyxRQUFRLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLEtBQUssNkJBQXFCLENBQUMsVUFBVTtvQkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFBQyxNQUFLO2dCQUNoRyxLQUFLLDZCQUFxQixDQUFDLFVBQVU7b0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQUMsTUFBSztnQkFDN0YsS0FBSyw2QkFBcUIsQ0FBQyxZQUFZO29CQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29C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