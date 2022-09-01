import { Client, ColorResolvable, GuildMember, Message, PartialMessage, User } from 'discord.js'
import { LocalStorage } from 'node-persist'
import { Logger } from 'winston'
import { VolumeTransformer } from 'prism-media'

import {
	AudioPlayerPlayingState,
	AudioPlayerStatus,
	createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel, PlayerSubscription, StreamType, VoiceConnectionStatus
} from '@discordjs/voice'

import { PrivateData, PrivateStorage } from './storage'
import { doTyping, Formatter } from './utils'
import { EventEmitter, Readable } from 'stream'

export interface IDiscordBot {
	readonly log: Logger
	readonly client: Client
	readonly adminRole: string
	readonly prefix: string

	listActions: () => string[]
	listMiddlewares: () => string[]
}

export interface IAction<T extends PrivateData> {
	readonly name: string
	readonly description: string
	readonly man?: string
	readonly defaults?: T

	readonly admin: boolean
	readonly roles?: string[]
	readonly users?: string[]

	init?: (
		privateData: PrivateStorage<T>,
		logger: Logger,
		client: ArmoredClient
	) => void | Promise<void>
	run: (
		message: ArmoredMessage,
		privateData: PrivateStorage<T>,
		logger: Logger
	) => void | Promise<void>
}
export class ArmoredAction<T extends PrivateData> {
	public readonly name: string
	private readonly clientAction: IAction<T>
	private readonly db: PrivateStorage<T>
	private readonly logger: Logger
	private readonly discordClient: ArmoredClient

	constructor (
		clientAction: IAction<T>,
		db: LocalStorage,
		logger: Logger,
		client: ArmoredClient
	) {
		this.name = clientAction.name
		this.clientAction = clientAction
		const privateStorage = new PrivateStorage<T>(
			db,
			`botiful:${this.name}`
		)
		this.db = privateStorage
		this.logger = logger
		this.discordClient = client
	}

	public async initializeClient (): Promise<void> {
		if (this.clientAction.defaults != null) {
			await this.db._gentlyApplyDefaults(this.clientAction.defaults)
		}
		if (this.clientAction.init != null) {
			await this.clientAction.init(this.db, this.logger, this.discordClient)
		}
	}

	public async runClient (message: ArmoredMessage): Promise<void> {
		await this.clientAction.run(message, this.db, this.logger)
	}

	public asContext (): ActionContext {
		return {
			name: this.clientAction.name,
			description: this.clientAction.description,
			man: this.clientAction.man,
			admin: this.clientAction.admin,
			roles: this.clientAction.roles,
			users: this.clientAction.users
		}
	}
}

export type ActionContext = Pick<
IAction<any>,
'name' | 'description' | 'man' | 'admin' | 'roles' | 'users'
>

export interface IMiddleware<T extends PrivateData> {
	readonly name: string
	readonly defaults?: T

	init?: (
		privateData: PrivateStorage<T>,
		logger: Logger,
		client: ArmoredClient
	) => {}

	apply: (
		context: ActionContext,
		message: ArmoredMessage,
		privateData: PrivateStorage<T>,
		logger: Logger
	) => boolean | Promise<boolean>
}
export class ArmoredMiddleware<T extends PrivateData> {
	public readonly name: string
	private readonly clientMiddleware: IMiddleware<T>
	private readonly db: PrivateStorage<T>
	private readonly logger: Logger
	private readonly discordClient: ArmoredClient

	constructor (
		clientMiddleware: IMiddleware<T>,
		db: LocalStorage,
		logger: Logger,
		client: ArmoredClient
	) {
		this.name = clientMiddleware.name
		this.clientMiddleware = clientMiddleware
		const privateStorage = new PrivateStorage<T>(
			db,
			`botiful:${this.name}`
		)
		this.db = privateStorage
		this.logger = logger
		this.discordClient = client
	}

	public async initializeClient (): Promise<void> {
		if (this.clientMiddleware.defaults != null) {
			await this.db._gentlyApplyDefaults(this.clientMiddleware.defaults)
		}
		if (this.clientMiddleware.init != null) {
			await this.clientMiddleware.init(this.db, this.logger, this.discordClient)
		}
	}

	public async applyClient (
		action: ActionContext,
		message: ArmoredMessage
	): Promise<boolean> {
		return await this.clientMiddleware.apply(
			action,
			message,
			this.db,
			this.logger
		)
	}
}

export class ArmoredMessage {
	public author: ArmoredUser
	public fromGuildOwner?: boolean
	public guildId?: string
	public channelId: string
	public mentionedUsers: ArmoredUser[]
	public content: string

	private readonly message: Message | PartialMessage
	private readonly formatter: Formatter

	constructor (message: Message | PartialMessage, formatter: Formatter) {
		if (message.content == null || message.author == null) { throw new Error("Message doesn't have content or author") }
		if (message.member == null) this.author = new ArmoredUser(message.author)
		else this.author = new ArmoredUser(message.author, message.member)
		this.mentionedUsers = [...message.mentions.users.values()]
			.map((x) => {
				if (message.mentions.members == null) return new ArmoredUser(x)
				else if (message.mentions.members.get(x.id) != null) return new ArmoredUser(x, message.mentions.members.get(x.id))
				else { return new ArmoredUser(x) }
			})
		this.guildId = message.guildId === null ? undefined : message.guildId
		this.fromGuildOwner = message.guild?.ownerId === this.author.id
		this.content = message.content
		this.channelId = message.channelId
		this.message = message
		this.formatter = formatter
	}

	public async respond (response: string): Promise<void> {
		const channel = this.message.channel
		await doTyping(channel, 500)
		await channel.send(this.formatter.fmt(response))
	}

	public async reply (response: string): Promise<void> {
		await doTyping(this.message.channel, 500)
		await this.message.reply(this.formatter.fmt(response))
	}

	public asCommand (): Command {
		return new Command(this.content)
	}
}

export class ArmoredUser {
	public username: string
	public id: string
	public tag: string

	private readonly member?: GuildMember

	constructor (user: User, member?: GuildMember) {
		this.username = user.username
		this.id = user.id
		this.tag = user.tag
		this.member = member
	}

	public getRoles (): string[] {
		if (this.member == null) throw new Error(`User ${this.tag} is not a member of this server`)
		return [...this.member.roles.cache.values()].map((x) => x.name)
	}

	public hasRole (role: string): boolean {
		if (this.member == null) throw new Error(`User ${this.tag} is not a member of this server`)
		const actualRole = this.member.guild.roles.cache.find((x) => x.name === role)
		if (actualRole == null) throw new Error(`Role with name ${role} doesn't exist`)
		return this.member.roles.cache.has(actualRole.id)
	}

	public hasAnyRole (roles: string[]): boolean {
		if (this.member == null) throw new Error(`User ${this.tag} is not a member of this server`)
		const actualRoles = this.member.guild.roles.cache.filter((x) => roles.some((y) => y === x.name))
		if (actualRoles == null) throw new Error(`No role exists with a name from [ ${roles.join(', ')} ]`)
		return this.member.roles.cache.hasAny(...actualRoles.keys())
	}

	public async giveRole (role: string): Promise<void> {
		if (this.member == null) throw new Error(`User ${this.tag} is not a member of this server`)
		const actualRole = this.member.guild.roles.cache.find((x) => x.name === role)
		if (actualRole == null) throw new Error(`Role with name ${role} doesn't exist`)
		await this.member.roles.add(actualRole.id)
	}

	public async removeRole (role: string): Promise<void> {
		if (this.member == null) throw new Error('User is not a member of this server')
		const actualRole = this.member.guild.roles.cache.find((x) => x.name === role)
		if (actualRole == null) throw new Error('Role doesn\'t exists')
		await this.member.roles.remove(actualRole)
	}

	public async joinInVoice (
		selfDeaf = true,
		selfMute = false
	): Promise<VoicePresence> {
		if (this.member == null) throw new Error(`${this.tag} isn't a member of this server`)
		if (
			this.member.voice.channel == null ||
      this.member.voice.channelId == null
		) throw new Error(`${this.tag} isn't in a voice channel`)
		const memberVoice = this.member.voice
		const player = createAudioPlayer()
		const voiceConnection = joinVoiceChannel({
			guildId: this.member.guild.id,
			channelId: memberVoice.id,
			// https://discordjs.guide/voice/voice-connections.html#creation
			adapterCreator:
				this.member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			selfDeaf,
			selfMute
		})
		return new VoicePresence(new PlayerSubscription(voiceConnection, player))
	}

	public isInVoiceChannel (): boolean {
		if (this.member == null) throw new Error(`${this.tag} isn't a member of this server`)
		return this.member.voice.channel != null
	}
}

export class ArmoredClient {
	constructor (private readonly client: Client) {}

	public guildsHaveRole (role: string): boolean {
		for (const guild of this.client.guilds.cache.values()) {
			if (!guild.roles.cache.some((x) => x.name === role)) return false
		}
		return true
	}

	public async createRoleInGuilds (name: string, color?: ColorResolvable, mentionable?: boolean): Promise<void> {
		await Promise.all(
			[...this.client.guilds.cache.values()]
				.filter((guild) => !guild.roles.cache.some((role) => role.name === name))
				.map(async (guild) => await guild.roles.create({ name, color, mentionable, reason: 'platform-botiful' }))
		)
	}
}

export class Command {
	public readonly command: string
	public readonly args: string[]

	constructor (stdin: string) {
		const cmdRegex = /("[^"]*"|\S+)/g
		const matches = stdin.match(cmdRegex)
		// Everything that's separated by spaces, unless in double-quotes.
		// In that case return that as one arg even if it includes spaces
		if (matches == null) {
			this.command = ''
			this.args = []
			return
		}
		const cmdArgs = matches.map((arg) =>
			/^".*"$/.test(arg) ? arg.substring(1, arg.length - 1) : arg
		)
		this.command = cmdArgs[0].substring(1)
		this.args = cmdArgs.slice(1)
	}
}

export class VoicePresence extends EventEmitter {
	private readonly subscription: PlayerSubscription
	/**
	 * Volume in decibels
	 */
	private volume?: number
	constructor (subscription: PlayerSubscription) {
		super()
		this.subscription = subscription
	}

	/**
	 * Final cleanup function. Can NOT use this after calling even if you call rejoin!
	 */
	public destroy (): void {
		this.subscription.player.stop()
		this.subscription.connection.destroy()
	}

	/**
	 * Rejoins voice chat and unpauses audio.
	 */
	public rejoin (): void {
		this.subscription.connection.rejoin()
		this.subscription.player.unpause()
	}

	/**
	 * Allows reconnect. Will pause any audio stream currently playing.
	 */
	public disconnect (): void {
		this.subscription.player.pause()
		this.subscription.connection.disconnect()
	}

	public isPlaying (): boolean {
		// Assume if not explicitly idle the player is doing something similar to
		// playing audio (e.g. buffering or paused)
		return this.subscription.player.state.status !== 'idle'
	}

	public pause (): void {
		const withPadding = true
		this.subscription.player.pause(withPadding)
	}

	public resume (): void {
		this.subscription.player.unpause()
	}

	public stopTransmitting (): void {
		this.subscription.player.stop()
		// TODO: test to see if this would do anything
		// this.subscription.connection.setSpeaking(false)
	}

	public startTransmitting (
		stream: string | Readable,
		format: StreamType = StreamType.WebmOpus
	): void {
		const resource = createAudioResource(stream, { inputType: format, inlineVolume: true })
		// TODO: Make fade if already playing a resource
		if (resource.volume == null) throw new Error('Expected resource to have volume property. Was it not created with the `inlineVolume: true` option?')
		if (this.subscription.connection.state.status !== VoiceConnectionStatus.Ready) throw new Error('Voice connection is not ready')
		if (this.volume != null) resource.volume.setVolumeDecibels(this.volume)
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
	public getVolume (): number {
		if (this.volume != null) return this.volume
		if (this.subscription.player.state.status === 'playing') {
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
		const state = this.subscription.player.state
		this.volume = db
		if ((state.status as AudioPlayerStatus) === 'playing') {
			this.setResourceVolume(db)
		}
	}

	private getResourceVolumeTransformer (): VolumeTransformer {
		const resourceVolume = (this.subscription.player.state as AudioPlayerPlayingState).resource.volume
		if (resourceVolume == null) throw new Error("This audio resource doesn't have a volume option and setVolume was called. Was it not created with the `inlineVolume: true` option?")
		return resourceVolume
	}

	private setResourceVolume (db: number): void {
		this.getResourceVolumeTransformer().setVolumeDecibels(db)
	}
}
