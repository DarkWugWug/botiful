import {
	Client,
	ColorResolvable,
	GuildMember,
	Message,
	MessageOptions,
	MessagePayload,
	PartialMessage,
	ReplyMessageOptions,
	User
} from 'discord.js'
import {
	createAudioPlayer,
	joinVoiceChannel
} from '@discordjs/voice'
import { PrivateData, PrivateStorage } from './storage'
import { doTyping, Formatter, UsageBuilder } from './utils'
import { VoicePresence } from './voice'

export interface IAction<T extends PrivateData> {
	readonly name: string
	readonly description: string
	readonly usage?: UsageBuilder
	readonly defaults?: T

	readonly admin: boolean
	readonly roles?: string[]
	readonly users?: string[]

	init?: (
		privateData: PrivateStorage<T>,
		client: ArmoredClient
	) => Promise<void>

	run: (
		message: ArmoredMessage,
		privateData: PrivateStorage<T>
	) => Promise<void>
}
export class ArmoredAction<T extends PrivateData> {
	public readonly name: string
	private readonly clientAction: IAction<T>
	private readonly store: PrivateStorage<T>
	private readonly armoredClient: ArmoredClient

	constructor (
		clientAction: IAction<T>,
		store: PrivateStorage<T>,
		client: ArmoredClient
	) {
		this.name = clientAction.name
		this.clientAction = clientAction
		this.store = store
		this.armoredClient = client
	}

	public async initializeClient (): Promise<void> {
		if (this.clientAction.defaults != null) {
			await this.store._gentlyApplyDefaults(this.clientAction.defaults)
		}
		if (this.clientAction.init != null) {
			await this.clientAction.init(this.store, this.armoredClient)
		}
	}

	public async runClient (message: ArmoredMessage): Promise<void> {
		await this.clientAction.run(message, this.store)
	}

	public asContext (): ActionContext {
		return {
			name: this.clientAction.name,
			description: this.clientAction.description,
			usage: this.clientAction.usage,
			admin: this.clientAction.admin,
			roles: this.clientAction.roles,
			users: this.clientAction.users
		}
	}
}

export type ActionContext = Pick<IAction<any>, 'name' | 'description' | 'usage' | 'admin' | 'roles' | 'users'>

export interface IMiddleware<T extends PrivateData> {
	readonly name: string
	readonly defaults?: T

	init?: (
		privateData: PrivateStorage<T>,
		client: ArmoredClient
	) => Promise<void>

	apply: (
		context: ActionContext,
		message: ArmoredMessage,
		privateData: PrivateStorage<T>
	) => Promise<boolean>
}
export class ArmoredMiddleware<T extends PrivateData> {
	public readonly name: string
	private readonly clientMiddleware: IMiddleware<T>
	private readonly store: PrivateStorage<T>
	private readonly discordClient: ArmoredClient

	constructor (
		clientMiddleware: IMiddleware<T>,
		store: PrivateStorage<T>,
		client: ArmoredClient
	) {
		this.name = clientMiddleware.name
		this.clientMiddleware = clientMiddleware
		this.store = store
		this.discordClient = client
	}

	public async initializeClient (): Promise<void> {
		if (this.clientMiddleware.defaults != null) {
			await this.store._gentlyApplyDefaults(this.clientMiddleware.defaults)
		}
		if (this.clientMiddleware.init != null) {
			await this.clientMiddleware.init(this.store, this.discordClient)
		}
	}

	public async applyClient (
		action: ActionContext,
		message: ArmoredMessage
	): Promise<boolean> {
		return await this.clientMiddleware.apply(
			action,
			message,
			this.store
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

	public async respond (x: string | MessagePayload | MessageOptions): Promise<void> {
		const channel = this.message.channel
		await doTyping(channel, 500)
		await channel.send(this.formatMessage(x))
	}

	public async reply (x: string | MessagePayload | ReplyMessageOptions): Promise<void> {
		await doTyping(this.message.channel, 500)
		await this.message.reply(this.formatMessage(x))
	}

	public asCommand (): Command {
		return new Command(this.content)
	}

	private formatMessage (message: string | MessagePayload | MessageOptions): string | MessagePayload | MessageOptions {
		if (typeof message === 'string') {
			// Dealing with string
			message = this.formatter.fmt(message)
		} else if (message instanceof MessagePayload) {
			// Dealing with MessagePayload
			if (message.options.content != null) message.options.content = this.formatter.fmt(message.options.content)
		} else if ('content' in message) {
			// Dealing with MessageOptions
			if (message.content != null) message.content = this.formatter.fmt(message.content)
		}
		return message
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

	public joinInVoice (
		selfDeaf = true,
		selfMute = false
	): VoicePresence {
		if (
			this.member == null
		) throw new Error(`${this.tag} isn't a member of this server`)
		if (
			this.member.voice.channel == null ||
      this.member.voice.channelId == null ||
			this.member.voice.channel.guildId == null
		) throw new Error(`${this.tag} isn't in a voice channel`)
		const guildId = this.member.voice.channel.guildId
		const player = createAudioPlayer()
		const voiceConnection = joinVoiceChannel({
			guildId,
			channelId: this.member.voice.channelId,
			// https://discordjs.guide/voice/voice-connections.html#creation
			adapterCreator:
				this.member.voice.channel.guild.voiceAdapterCreator,
			selfDeaf,
			selfMute
		})
		const subscription = voiceConnection.subscribe(player)
		if (subscription == null) throw new Error('When creating the voice connection, failed to subscribe to the audio player')
		return new VoicePresence(guildId, player)
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
			console.log(`ROLE: ${[...guild.roles.cache.values()].map((x) => x.name).join(', ')}`)
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
