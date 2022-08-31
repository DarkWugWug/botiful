import { Client, GuildMember, Message, PartialMessage, User } from 'discord.js'
import { LocalStorage } from 'node-persist'
import { Logger } from 'winston'

import {
	createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel, PlayerSubscription
} from '@discordjs/voice'

import { PrivateData, PrivateStorage } from './storage'
import { doTyping, Formatter } from './utils'

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
		logger: Logger
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
			await this.clientAction.init(this.db, this.logger)
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

	init?: (privateData: PrivateStorage<T>, logger: Logger) => {}

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
			await this.clientMiddleware.init(this.db, this.logger)
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
	public mentionedUsers: ArmoredUser[]
	public content: string

	private readonly message: Message | PartialMessage
	private readonly formatter: Formatter

	constructor (message: Message | PartialMessage, formatter: Formatter) {
		if (message.content === null || message.author == null) { throw new Error("Message doesn't have content or author") }
		this.author = new ArmoredUser(message.author)
		this.mentionedUsers = message.mentions.users.map(
			(x) => new ArmoredUser(x)
		)
		this.guildId = message.guildId === null ? undefined : message.guildId
		this.fromGuildOwner = message.guild?.ownerId === this.author.id
		this.content = message.content

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

	public async tryJoinAuthorInVoice (
		selfDeaf = true,
		selfMute = false
	): Promise<PlayerSubscription> {
		if (this.message.member == null) {
			throw await this.dispatchError(
				`${this.author.username} isn't a member of this server`
			)
		}
		if (
			this.message.member.voice.channel == null ||
      this.message.member.voice.channelId == null
		) {
			throw await this.dispatchError(
				`${this.author.username} isn't in a voice channel`
			)
		}
		if (this.message.guild == null || this.guildId == null) {
			throw await this.dispatchError(
				"Hmmm... you didn't send this in a server. I can only join server voice chats."
			)
		}
		const memberVoice = this.message.member.voice // The checks above should ensure this exists
		const player = createAudioPlayer()
		try {
			const voiceConnection = joinVoiceChannel({
				guildId: this.guildId,
				channelId: memberVoice.id,
				// https://discordjs.guide/voice/voice-connections.html#creation
				adapterCreator:
					this.message.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
				selfDeaf,
				selfMute
			})
			return new PlayerSubscription(voiceConnection, player)
		} catch (err) {
			throw await this.dispatchError(
				`I was looking for '${this.message.member.voice.channel.name}', but couldn't find it. Can :adminRole: help us?`
			)
		}
	}

	public async authorHasRole (role: string): Promise<boolean> {
		if (this.message.member == null) {
			throw await this.dispatchError(
				`${this.author.username} isn't a member of this server`
			)
		}
		return this.message.member.roles.cache.has(role)
	}

	public async authorHasAnyRole (role: string | string[]): Promise<boolean> {
		if (this.message.member == null) {
			throw await this.dispatchError(
				`${this.author.username} isn't a member of this server`
			)
		}
		return this.message.member.roles.cache.hasAny(...role)
	}

	private async dispatchError (text: string): Promise<Error> {
		await this.reply(text)
		return new Error(text)
	}
}

export class ArmoredUser {
	public username: string
	public id: string
	public tag: string

	public member?: GuildMember

	constructor (user: User, member?: GuildMember) {
		this.username = user.username
		this.id = user.id
		this.tag = user.tag
		this.member = member
	}

	public hasRole (role: string): boolean {
		if (this.member == null) return false
		return this.member.roles.cache.has(role)
	}
}

// TODO: Currently there are no use-cases for exposing any feature of the
//       DiscordJS client. When they manifest, add them here. This ensures a
//       level-of-control between clients and the DiscordJS client.

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ArmoredClient {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor (_client: Client) {}
}
