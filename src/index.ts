import { Client, Message, PartialMessage } from 'discord.js'
import persist, { LocalStorage } from 'node-persist'
import { Logger } from 'winston'

import { HelpAction, ManCommand } from './actions'
import { getCompleteConfig, IDiscordBotConfig } from './config'
import {
	ActionContext, ArmoredAction, ArmoredClient, ArmoredMessage, ArmoredMiddleware, IAction,
	IDiscordBot, IMiddleware
} from './foundation'
import { initLogger } from './logger'
import { AdminAccessMiddleware, RbacMiddleware, UsernameAccessMiddleware } from './middleware'
import { PrivateData } from './storage'
import { Formatter } from './utils'

export {
	IAction,
	ActionContext,
	IMiddleware,
	IDiscordBot,
	ArmoredMessage as Message,
	ArmoredUser as User
} from './foundation'
export { PrivateStorage as Store } from './storage'
export { Logger } from 'winston'

export class DiscordBot implements IDiscordBot {
	public readonly config: { [key: string]: any }
	public readonly log: Logger
	public readonly client: Client
	public readonly adminRole: string
	public readonly prefix: string

	private actions: Record<string, ArmoredAction<any>> = {}
	private middleware: Record<string, ArmoredMiddleware<any>> = {}
	private readonly store: LocalStorage
	private readonly token: string
	private readonly formatter: Formatter

	public constructor (options: IDiscordBotConfig) {
		const config = getCompleteConfig(options)
		this.log = initLogger(config)
		this.config = config.data
		this.prefix = config.prefix
		this.token = config.token
		this.adminRole = config.admin
		this.client = new Client({
			intents: config.intents
		})
		this.formatter = new Formatter(this.prefix, this.adminRole, this.client)
		this.store = persist
	}

	public listActions (): string[] {
		return Object.keys(this.actions)
	}

	public listMiddlewares (): string[] {
		return Object.keys(this.middleware)
	}

	public async logout (): Promise<void> {
		await this.client.destroy()
		this.log.info('Bot logged out and shutdown')
	}

	public async start (): Promise<void> {
		await this.init()
		this.log.info('Starting Discord Bot...')
		try {
			await this.client.login(this.token)
			if (this.client.user != null) {
				this.log.info(`${this.client.user.username} has logged in and started!`)
			} else {
				this.log.info('Logged in and started!')
			}
		} catch (err) {
			this.log.error(`Failed to login: ${JSON.stringify(err as Error)}`)
		}
	}

	public async runAction (msg: Message | PartialMessage): Promise<void> {
		if (msg.content == null || (msg.author == null)) {
			this.log.debug(
				'Got message without content OR author. Ignoring...'
			)
			return
		}
		if (this.client.user == null || msg.author.equals(this.client.user)) return
		// TODO: Add Lexers as a capability to bot that would allow 'eager' running of code if certain phrases/keywords are present
		if (!msg.content.startsWith(this.prefix)) return // It's just a general text message not meant for this bot; Do nothing
		const command = new Command(msg.content)
		const message = new ArmoredMessage(msg, this.formatter)
		const isLoaded = Object.keys(this.actions).find(
			(x) => x === command.command
		)
		if (isLoaded == null) {
			let helpCmd = 'help'
			for (const action of Object.values(this.actions)) {
				if (action instanceof HelpAction) helpCmd = action.name
			}
			await message.reply(
				`\`:prefix:${command.command}\` is not a command. Use \`:prefix:${helpCmd}\` to see all commands.`
			)
			return
		}
		const action = this.actions[command.command]
		const authorized = await this.applyMiddleware(
			action.asContext(),
			message
		)
		if (!authorized) return // For now it's best practice to let the middleware report back, though in the future this needs hardening
		await action.runClient(message)
	}

	public loadActions<T extends PrivateData>(
		actionsParam: Array<IAction<T>> | IAction<T>
	): void {
		if (actionsParam instanceof Array) {
			for (const action of actionsParam) {
				this.actions[action.name] = new ArmoredAction(
					action,
					this.store,
					this.log,
					new ArmoredClient(this.client)
				)
			}
		} else {
			this.actions[actionsParam.name] = new ArmoredAction(
				actionsParam,
				this.store,
				this.log,
				new ArmoredClient(this.client)
			)
		}
	}

	public loadMiddleware<T extends PrivateData>(
		middlewareParam: Array<IMiddleware<T>> | IMiddleware<T>
	): void {
		if (middlewareParam instanceof Array) {
			for (const middleware of middlewareParam) {
				this.middleware[middleware.name] = new ArmoredMiddleware(
					middleware,
					this.store,
					this.log,
					new ArmoredClient(this.client)
				)
			}
		} else {
			this.middleware[middlewareParam.name] = new ArmoredMiddleware(
				middlewareParam,
				this.store,
				this.log,
				new ArmoredClient(this.client)
			)
		}
	}

	private async initStorage (): Promise<void> {
		await this.store.init({
			dir: './data',
			expiredInterval: 1 * 60 * 1000
		})
		this.log.info('Initialized data store')
	}

	private async initMiddlewares (): Promise<void> {
		const botifulMiddleware = [
			new AdminAccessMiddleware(this.adminRole),
			new RbacMiddleware(),
			new UsernameAccessMiddleware()
		]
		this.loadMiddleware(botifulMiddleware)
		const middlewaresWithInit = Object.values(this.middleware).map(
			(x) => x.initializeClient
		)
		await Promise.all(middlewaresWithInit)
		this.log.info(
			`Middlewares loaded and initialized: [ ${this.listMiddlewares().join(
				', '
			)} ]`
		)
	}

	private async initActions (): Promise<void> {
		const actionContexts = Object.values(this.actions).map((x) =>
			x.asContext()
		)
		const botifulActions = [
			new HelpAction(actionContexts),
			new ManCommand()
		]
		this.loadActions(botifulActions)
		const actionsInit = Object.values(this.actions).map(
			(x) => x.initializeClient
		)
		await Promise.all(actionsInit)
		this.log.info(
			`Actions loaded and initialized: [ ${this.listActions().join(
				', '
			)} ]`
		)
	}

	private async init (): Promise<void> {
		await this.initStorage()
		await Promise.all([this.initMiddlewares(), this.initActions()])
		this.client.on('messageCreate', async (msg) => await this.runAction(msg))
		this.client.on('messageUpdate', async (oldMsg, newMsg) => {
			if (
				oldMsg.content === newMsg.content ||
				(newMsg.embeds.length > 0 && oldMsg.embeds.length === 0)
			) {
				return
			}
			await this.runAction(newMsg)
		})
	}

	private async applyMiddleware (
		action: ActionContext,
		message: ArmoredMessage
	): Promise<boolean> {
		for (const name in this.middleware) {
			if (!(await this.middleware[name].applyClient(action, message))) { return false }
		}
		return true
	}
}

class Command {
	public readonly command: string
	public readonly args: string[]

	constructor (stdin: string) {
		const cmdRegex = /("[^"]*"|\S+)/g
		const parsedCmd = stdin.match(cmdRegex)
		if (parsedCmd == null) {
			this.command = ''
			this.args = []
		} else {
			const cmdArgs = (parsedCmd.map((arg) =>
				/^".*"$/.test(arg) ? arg.substring(1, arg.length - 2) : arg
			))
			this.command = cmdArgs[0].substring(1)
			this.args = cmdArgs.slice(1)
		}
	}
}
