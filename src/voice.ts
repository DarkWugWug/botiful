import { VolumeTransformer } from 'prism-media'
import {
	AudioPlayer,
	AudioPlayerPlayingState,
	AudioPlayerStatus,
	createAudioResource,
	getVoiceConnection,
	StreamType,
	VoiceConnectionStatus
} from '@discordjs/voice'
import { EventEmitter, Readable } from 'stream'

export interface VoicePresenceEvent {
	/**
	 * Emitted when the Discord voice connection has an error.
	 */
	connectionError: (event: Error, streamName: string | undefined) => void

	connectionSignalling: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is disconnected (but still able
	 * to be used with .rejoin()).
	 */
	connectionStandby: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is establishing a connection.
	 */
	connectionJoining: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is active and healthy.
	 */
	connectionReady: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection has been destroyed and untracked,
	 * it cannot be reused.
	 */
	connectionDestroyed: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio resource being played has an error.
	 */
	playerError: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player has no resource to play.
	 * This is the starting state.
	 */
	playerIdle: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player is waiting for a resource to become readable.
	 */
	playerBuffering: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player is actively playing an AudioResource. When playback ends,
	 * it will enter the Idle state.
	 */
	playerStreaming: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player has either been explicitly paused by the user,
	 * or done automatically by the audio player itself.
	 */
	playerPaused: (streamName: string | undefined) => void
}

// Pattern: https://www.derpturkey.com/typescript-and-node-js-eventemitter/
export interface VoicePresence extends EventEmitter {
	// matches EventEmitter.on
	on: <U extends keyof VoicePresenceEvent>(event: U, listener: VoicePresenceEvent[U]) => this

	// matches EventEmitter.off
	off: <U extends keyof VoicePresenceEvent>(event: U, listener: VoicePresenceEvent[U]) => this

	// matches EventEmitter.emit
	emit: <U extends keyof VoicePresenceEvent>(
		event: U,
		...args: Parameters<VoicePresenceEvent[U]>
	) => boolean
}

export class VoicePresence extends EventEmitter {
	private readonly guildId: string
	private readonly stream: AudioPlayer
	private streamName?: string
	/**
	* Volume in decibels
	*/
	private volume?: number

	constructor (guildId: string, player: AudioPlayer) {
		super()
		this.guildId = guildId
		const voice = getVoiceConnection(guildId)
		if (voice == null) throw new Error(`Guild ${guildId} doesn't have an active voice connection! Join the user with User.joinInVoice() or construct your own with @discordjs/voice.joinVoiceChannel() before calling this!`)
		voice.on('error', (err: Error) => this.emit('connectionError', err, this.streamName))
		voice.on('stateChange', (_oldState, newState) => {
			switch (newState.status) {
				case VoiceConnectionStatus.Signalling: this.emit('connectionSignalling', this.streamName); break
				case VoiceConnectionStatus.Connecting: this.emit('connectionJoining', this.streamName); break
				case VoiceConnectionStatus.Disconnected: this.emit('connectionStandby', this.streamName); break
				case VoiceConnectionStatus.Ready: this.emit('connectionReady', this.streamName); break
				case VoiceConnectionStatus.Destroyed: this.emit('connectionDestroyed', this.streamName); break
			}
		})
		this.stream = player
		player.on('error', () => this.emit('playerError', this.streamName))
		player.on('stateChange', (_oldState, newState) => {
			switch (newState.status) {
				case AudioPlayerStatus.Idle: this.emit('playerIdle', this.streamName); break
				case AudioPlayerStatus.Buffering: this.emit('playerBuffering', this.streamName); break
				case AudioPlayerStatus.Playing: this.emit('playerStreaming', this.streamName); break
				case AudioPlayerStatus.AutoPaused:
				case AudioPlayerStatus.Paused: this.emit('playerPaused', this.streamName); break
			}
		})
	}

	/**
	 * Rejoins voice chat and unpauses audio (if any).
	 */
	public rejoin (channelId?: string, selfDeaf?: boolean, selfMute?: boolean): void {
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Guild ${this.guildId} doesn't have a voice connection to rejoin`)
		const newJoinConfig = voice.joinConfig
		if (channelId != null) newJoinConfig.channelId = channelId
		if (selfDeaf != null) newJoinConfig.selfDeaf = selfDeaf
		if (selfMute != null) newJoinConfig.selfMute = selfMute
		voice.rejoin(newJoinConfig)
		this.stream.unpause()
	}

	/**
	 * By default, this will disconnect and destroy the bots the voice connection.
	 * From then on the bot will be non-function. It has been destroyed and even
	 * if you call rejoin nothing will happen. This will also stop and destroy any
	 * audio stream currently playing.
	 *
	 * If called with `final = false` this will disconnect from the voice channel
	 * but leave the underlying voice connection to discord intact: this allows
	 * the bot to rejoin. (See: `.rejoin()`). This will will pause any audio
	 * stream currently playing.
	 */
	public disconnect (final = true): void {
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Guild ${this.guildId} doesn't have a voice connection to disconnect`)
		if (final) {
			this.stopTransmitting()
			voice.destroy()
		} else {
			this.pause()
			voice.disconnect()
		}
	}

	public isPlaying (): boolean {
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Couldn't determine if this is playing because there is no voice connection for guild ${this.guildId}`)
		return this.stream.state.status === 'playing' && voice.state.status === 'ready'
	}

	public pause (): void {
		this.stream.pause()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot pause streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(false)
	}

	public resume (): void {
		this.stream.unpause()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot resume streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(true)
	}

	public stopTransmitting (): void {
		this.streamName = undefined
		this.stream.stop()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot stop streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(false)
	}

	public startTransmitting (
		stream: string | Readable,
		streamName?: string,
		format: StreamType = StreamType.Arbitrary
	): void {
		this.streamName = streamName
		const resource = createAudioResource(stream, { inputType: format, inlineVolume: true })
		if (resource.volume == null) throw new Error('Expected resource to have volume property. Was it not created with the `inlineVolume: true` option?')
		// TODO: Make cross fade if already playing a resource
		if (this.volume == null) this.volume = 55
		else resource.volume.setVolumeDecibels(this.volume)
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot start streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(true)
		this.stream.play(resource)
	}

	/**
	 * If there's a volume set for this VoicePresence it will return that as all
	 * resources should be transmitting at that volume level. Otherwise, it will
	 * return the value of the currently playing track.
	 * Errors: If there isn't a volume set and there isn't anything playing. What
	 * did you want?
	 * @returns Volume in decibels
	 */
	public getVolume (): number {
		if (this.volume != null) return this.volume
		if (this.stream.state.status === 'playing') {
			return this.getResourceVolumeTransformer().volumeDecibels
		}
		throw new Error("Couldn't find volume for VoicePresence and nothing was playing. Only call if set or playing something!")
	}

	/**
	 * Sets the volume for this VoicePresence
	 * @param db Volume level in decibels
	 */
	public setVolume (db: number): void {
		if (db < 0 || db > 1) throw new Error(`Invalid volume setting: ${db}. Must be a number from 0.0 to 1.0`)
		const state = this.stream.state
		this.volume = db
		if ((state.status as AudioPlayerStatus) === 'playing') {
			this.setResourceVolume(db)
		}
	}

	private getResourceVolumeTransformer (): VolumeTransformer {
		const resourceVolume = (this.stream.state as AudioPlayerPlayingState).resource.volume
		if (resourceVolume == null) throw new Error("This audio resource doesn't have a volume option and setVolume was called. Was it not created with the `inlineVolume: true` option?")
		return resourceVolume
	}

	private setResourceVolume (db: number): void {
		this.getResourceVolumeTransformer().setVolumeDecibels(db)
	}
}
