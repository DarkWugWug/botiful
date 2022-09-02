import { getVoiceConnections } from '@discordjs/voice'
import { Client, Message, PartialMessage, GatewayIntentsString as Intent } from 'discord.js'
import EventEmitter from 'events'
import persist, { LocalStorage } from 'node-persist'
import { Logger } from 'winston'
import {
	ActionContext, ArmoredAction, ArmoredClient, ArmoredMessage, ArmoredMiddleware, IAction,
	IDiscordBot, IMiddleware, Command
} from './foundation'
import { PrivateData, PrivateStorage } from './storage'
import { Formatter } from './utils'
import { HelpAction } from './common/actions'
import { AdminAccessMiddleware, RbacMiddleware } from './common/middleware'

export { Logger } from 'winston'
export {
	ActionContext,
	ArmoredClient as Client,
	ArmoredMessage as Message,
	ArmoredUser as User,
	Command,
	IAction,
	IDiscordBot,
	IMiddleware
} from './foundation'
export { VoicePresence } from './voice'
export { PrivateStorage as Store } from './storage'
export { GatewayIntentsString as Intent } from 'discord.js'
export { Formatter, UsageBuilder } from './utils'

const DEFAULT_DATA_DIR = './data'
export interface BotifulOptions {
	/**
	 * Must only be one character long! Default is the exclamation point, '!'.
	 */
	prefix?: string
	/**
	 * Path to directory where the bot's middleware and actions will store persistent
	 * data. Defaults to `./data`.
	 */
	dataDir?: string
}

export class DiscordBot implements IDiscordBot {
	public readonly adminRole: string = 'Botiful'
	public readonly prefix: string = '!'
	public readonly formatter: Formatter
	public readonly client: ArmoredClient

	private readonly _client: Client
	private readonly actions: Map<string, ArmoredAction<any>> = new Map()
	private readonly middleware: Map<string, ArmoredMiddleware<any>> = new Map()
	private readonly store: LocalStorage
	private readonly emitter: EventEmitter

	public static async MakeBotiful (
		authToken: string,
		intents: Intent[],
		logger?: Logger,
		options?: BotifulOptions
	): Promise<DiscordBot> {
		const client = new Client({ intents })
		try {
			await client.login(authToken)
			const bot = new DiscordBot(client)
			if (options?.dataDir != null) await bot.loadStorage(options.dataDir)
			else await bot.loadStorage(DEFAULT_DATA_DIR)
			await bot.registerAction(...[
				new HelpAction(bot.formatter, bot.emitter, bot.getActions())
			])
			await bot.registerMiddleware(...[
				new AdminAccessMiddleware(bot.adminRole, logger),
				new RbacMiddleware(
					bot.emitter,
					[...bot.actions.values()].map((x) => x.asContext()),
					logger
				)
			])
			bot.registerDefaultSignalHandlers(logger)
			return bot
		} catch (err) {
			throw new Error(`Failed to login to Discord: ${(err as Error).message}`, { cause: err as Error })
		}
	}

	private constructor (
		client: Client,
		prefix?: string
	) {
		this._client = client
		this.client = new ArmoredClient(client)
		if (prefix != null) {
			if (prefix.length !== 1) {
				throw new Error(`Expected: Botiful prefix to be 1 character long. Got ${prefix.length} characters! Given Prefix: ${prefix}`)
			}
			this.prefix = prefix
		}
		this.formatter = new Formatter(this.prefix, this.adminRole, client)
		this.store = persist
		this.emitter = new EventEmitter()
		this._client.on('messageCreate', async (msg) => await this.runAction(msg))
		this._client.on('messageUpdate', async (oldMsg, newMsg) => {
			if (
				oldMsg.content === newMsg.content ||
				(newMsg.embeds.length > 0 && oldMsg.embeds.length === 0)
			) {
				return
			}
			await this.runAction(newMsg)
		})
	}

	public getActions (): ActionContext[] {
		return [...this.actions.values()].map((x) => x.asContext())
	}

	public getMiddleware (): string[] {
		return [...this.middleware.keys()]
	}

	public async registerAction<T extends PrivateData>(
		...actionList: Array<IAction<T>>
	): Promise<void> {
		for (const action of actionList) {
			if (this.actions.has(action.name)) throw new Error(`Action with an identical name has already been registered. Names must be unique. Given: ${action.name}`)
			const privateStore = new PrivateStorage<T>(
				this.store,
				`botiful:${action.name}`
			)
			if (action.init != null) await action.init(privateStore, this.client)
			const armoredAction = new ArmoredAction(action, privateStore, this.client)
			this.actions.set(action.name, armoredAction)
			const actionContext = armoredAction.asContext()
			this.emitter.emit('actionLoaded', actionContext)
		}
	}

	public async registerMiddleware<T extends PrivateData>(
		...middlewareList: Array<IMiddleware<T>>
	): Promise<void> {
		for (const middleware of middlewareList) {
			if (this.actions.has(middleware.name)) throw new Error(`Middleware the an identical name has already been registered! Names must be unique. Given: ${middleware.name}`)
			const privateStore = new PrivateStorage<T>(
				this.store,
				`botiful:${middleware.name}`
			)
			if (middleware.init != null) await middleware.init(privateStore, this.client)
			this.middleware.set(
				middleware.name,
				new ArmoredMiddleware(middleware, privateStore, this.client)
			)
		}
	}

	private async runAction (rawMessage: Message | PartialMessage): Promise<void> {
		if (this._client.user == null || rawMessage.author === this._client.user) return
		if (rawMessage.content == null) throw new Error('Failed to parse message because the CONTENT was undefined')
		if (rawMessage.author == null) throw new Error('Failed to parse message because the AUTHOR was undefined')
		if (!rawMessage.content.startsWith(this.prefix)) return
		const command = new Command(rawMessage.content)
		const message = new ArmoredMessage(rawMessage, this.formatter)
		const action = this.actions.get(command.command)
		if (action == null) {
			await message.reply(
				`\`:prefix:${command.command}\` is not a command. Use \`:prefix:man ${command.command}\` to see a how to use it or \`:prefix:help\` to see a list of all commands.`
			)
			return
		}
		if (!await this.isAuthorized(action.asContext(), message)) {
			// TODO: message.react(🚫👮‍♀️🚫)
			return
		}
		await action.runClient(message)
	}

	private registerDefaultSignalHandlers (logger?: Logger): void {
		process.on('SIGINT', () => {
			getVoiceConnections().forEach((connection) => connection.disconnect())
			this._client.destroy()
			if (logger != null) {
				if (this._client.user == null) logger.info('Bot logged out of Discord')
				else logger.info(`${this._client.user.username} has logged out of Discord`)
			}
			process.exit(0)
		})
		if (logger != null) {
			this._client.on('error', (err) => {
				logger.error(`Discord client had error: ${err.message}`)
			})
		}
	}

	private async loadStorage (dir: string): Promise<void> {
		await this.store.init({ dir, expiredInterval: 1 * 60 * 1000 })
	}

	private async isAuthorized (
		action: ActionContext,
		message: ArmoredMessage
	): Promise<boolean> {
		for (const middleware of this.middleware.values()) {
			const passes = await middleware.applyClient(action, message)
			if (!passes) { return false } // TODO: For now let the middleware handle the reporting, eventually harden this
		}
		return true
	}
}
