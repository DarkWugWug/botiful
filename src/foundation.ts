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
		if (this.member == null) throw new Error('User is not a member of this server')
		return Object.values(this.member.roles.cache).map((x) => x.name)
	}

	public hasRole (role: string): boolean {
		if (this.member == null) throw new Error('User is not a member of this server')
		return this.member.roles.cache.some((x) => x.name === role)
	}

	public hasAnyRole (roles: string[]): boolean {
		if (this.member == null) throw new Error('User is not a member of this server')
		return this.member.roles.cache.some((x) => roles.some((y) => x.name === y))
	}

	public async giveRole (role: string): Promise<void> {
		if (this.member == null) throw new Error('User is not a member of this server')
		await this.member.roles.add(role)
	}

	public async removeRole (role: string): Promise<void> {
		if (this.member == null) throw new Error('User is not a member of this server')
		await this.member.roles.remove(role)
	}

	public async tryJoinInVoice (
		selfDeaf = true,
		selfMute = false
	): Promise<PlayerSubscription> {
		if (this.member == null) throw new Error(`${this.tag} isn't a member of this server`)
		if (
			this.member.voice.channel == null ||
      this.member.voice.channelId == null
		) throw new Error(`${this.tag} isn't in a voice channel`)
		const memberVoice = this.member.voice // The checks above should ensure this exists
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
		return new PlayerSubscription(voiceConnection, player)
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
