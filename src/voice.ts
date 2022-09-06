import {
	AudioPlayerStatus,
	createAudioResource,
	getVoiceConnection,
	PlayerSubscription,
	StreamType,
	VoiceConnection,
	VoiceConnectionStatus
} from '@discordjs/voice'
import { EventEmitter, Readable } from 'stream'

export interface VoicePresenceEvent {
	/**
	 * Emitted when the Discord voice connection has an error.
	 * @event
	 */
	connectionError: (event: Error, streamName: string | undefined) => void
	/**
	 * Emitted when the voice connection releases debugging information
	 * @event
	 */
	connectionDebug: (message: string) => void
	/**
	 * Emitted when the Discord voice connection is waiting to receive a
	 * VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE packet from Discord, provided by
	 * the adapter. This is it's default state.
	 * @event
	 */
	connectionSignalling: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is disconnected (but still able
	 * to be used with .rejoin()).
	 * @event
	 */
	connectionStandby: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is establishing a connection.
	 * @event
	 */
	connectionJoining: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection is active and healthy.
	 * @event
	 */
	connectionReady: (streamName: string | undefined) => void
	/**
	 * Emitted when the Discord voice connection has been destroyed and untracked,
	 * it cannot be reused.
	 * @event
	 */
	connectionDestroyed: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio resource being played has an error.
	 * @event
	 */
	playerError: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player releases debugging information
	 * @event
	 */
	playerDebug: (message: string) => void
	/**
	 * Emitted when the audio player is subscribed to a voice connection
	 * @event
	 */
	playerSubscribe: (subscription: PlayerSubscription) => void
	/**
	 * Emitted when the audio player unsubscribed by a voice connection
	 * @event
	 */
	playerUnsubscribe: (subscription: PlayerSubscription) => void
	/**
	 * Emitted when the audio player has no resource to play.
	 * This is the starting state.
	 * @event
	 */
	playerIdle: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player is waiting for a resource to become readable.
	 * @event
	 */
	playerBuffering: (streamName: string | undefined) => void
	/**
	 * Emitted when the audio player is actively playing an AudioResource. When playback ends,
	 * it will enter the Idle state.
	 * @event
	 */
	playerStreaming: (streamName: string | undefined, volume: number | undefined) => void
	/**
	 * Emitted when the audio player has either been explicitly paused by the user,
	 * or done automatically by the audio player itself.
	 * @event
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
	private readonly subscription: PlayerSubscription
	private streamName?: string
	/**
	 * Volume in decibels
	 */
	private volume: number = 60

	constructor (guildId: string, subscription: PlayerSubscription) {
		super()
		this.guildId = guildId
		this.subscription = subscription
		const voice = getVoiceConnection(guildId)
		if (voice == null) throw new Error(`Guild ${guildId} doesn't have an active voice connection! Join the user with User.joinInVoice() or construct your own with @discordjs/voice.joinVoiceChannel() before creating a VoicePresences!`)
		this.registerEventForwarders(voice)
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
		this.subscription.player.unpause()
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

	public isTransmitting (): boolean {
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Couldn't determine if this is playing because there is no voice connection for guild ${this.guildId}`)
		return this.subscription.player.state.status === 'playing' && voice.state.status === 'ready'
	}

	public pause (): void {
		this.subscription.player.pause()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot pause streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(false)
	}

	public resume (): void {
		this.subscription.player.unpause()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot resume streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(true)
	}

	public stopTransmitting (): void {
		this.streamName = undefined
		this.subscription.player.stop()
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot stop streaming because there is no voice connection for guild ${this.guildId}`)
		voice.setSpeaking(false)
	}

	public startTransmitting (
		stream: string | Readable,
		streamName?: string,
		inputType: StreamType = StreamType.Arbitrary
	): void {
		this.streamName = streamName
		const resource = createAudioResource(stream, { inputType, inlineVolume: true })
		if (resource.volume == null) throw new Error('Internal Error: Expected volume transformer to not be null')
		resource.volume.setVolumeDecibels(this.volume)
		const voice = getVoiceConnection(this.guildId)
		if (voice == null) throw new Error(`Cannot start transmitting: there are no voice connections for guild ${this.guildId}. Did you create a voice connection with 'User.joinInVoice()' or manually with '@discordjs/voice.createVoiceConnection()' before calling this?`)
		voice.setSpeaking(true)
		this.subscription.player.play(resource)
	}

	/**
	 * If there's a volume set for this VoicePresence it will return that as all
	 * resources should be transmitting at that volume level. Otherwise, it will
	 * return the value of the currently playing track.
	 * Errors: If there isn't a volume set and there isn't anything playing. What
	 * did you want?
	 * @returns Volume in decibels
	 */
	public getVolume (): number | undefined {
		return this.volume
	}

	/**
	 * Sets the volume for this VoicePresence
	 * @param db Volume level in decibels
	 */
	public setVolume (db: number): void {
		this.volume = db
		const state = this.subscription.player.state
		if (state.status === AudioPlayerStatus.Playing) {
			state.resource.volume?.setVolumeDecibels(db)
		}
	}

	private registerEventForwarders (voice: VoiceConnection): void {
		voice.on('error', (err: Error) => this.emit('connectionError', err, this.streamName))
		voice.on('debug', (message) => this.emit('playerDebug', message))
		voice.on('stateChange', (_oldState, newState) => {
			switch (newState.status) {
				case VoiceConnectionStatus.Signalling: this.emit('connectionSignalling', this.streamName); break
				case VoiceConnectionStatus.Connecting: this.emit('connectionJoining', this.streamName); break
				case VoiceConnectionStatus.Disconnected: this.emit('connectionStandby', this.streamName); break
				case VoiceConnectionStatus.Ready: this.emit('connectionReady', this.streamName); break
				case VoiceConnectionStatus.Destroyed: this.emit('connectionDestroyed', this.streamName); break
			}
		})
		this.subscription.player.on('error', () => this.emit('playerError', this.streamName))
		this.subscription.player.on('debug', (message: string) => this.emit('playerDebug', message))
		this.subscription.player.on('subscribe', (subscription) => this.emit('playerSubscribe', subscription))
		this.subscription.player.on('unsubscribe', (subscription) => this.emit('playerUnsubscribe', subscription))
		this.subscription.player.on('stateChange', (_oldState, newState) => {
			switch (newState.status) {
				case AudioPlayerStatus.Idle: this.emit('playerIdle', this.streamName); break
				case AudioPlayerStatus.Buffering: this.emit('playerBuffering', this.streamName); break
				case AudioPlayerStatus.Playing: this.emit('playerStreaming', this.streamName, newState.resource.volume?.volumeDecibels); break
				case AudioPlayerStatus.AutoPaused:
				case AudioPlayerStatus.Paused: this.emit('playerPaused', this.streamName); break
			}
		})
	}
}
