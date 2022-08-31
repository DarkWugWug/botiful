import EventEmitter from 'events'
import { IAction, Logger, Message, Store } from './'
import { ActionContext } from './foundation'

export class HelpAction implements IAction<{}> {
	public readonly name = 'help'
	public readonly description =
		'Displays a list of all commands available to you'

	public readonly admin = false

	private readonly actions: ActionContext[] = []

	constructor (emitter: EventEmitter, current?: ActionContext[]) {
		if (current != null) this.actions.push(...current)
		emitter.on('actionLoaded', (x: ActionContext) => {
			this.actions.push(x)
		})
	}

	public async run (
		message: Message,
		_store: Store<{}>,
		_logger: Logger
	): Promise<void> {
		await message.reply(this.parseHelpString(this.actions))
	}

	private parseHelpString (actionList: ActionContext[]): string {
		const header = '**Actions:**\n\n'
		const actionsText = actionList
			.map((x) => `${`\`:prefix:${x.name}\``}: ${x.description}`)
			.join('\n\n')
		return header + actionsText
	}
}

export class ManCommand implements IAction<{}> {
	public readonly name = 'man'
	public readonly description =
		'Displays in-depth help for an action'

	public readonly man = '!man <command>'
	public readonly admin = false

	private readonly actions: ActionContext[] = []

	constructor (emitter: EventEmitter, current?: ActionContext[]) {
		if (current != null) this.actions.push(...current)
		emitter.on('actionLoaded', (x: ActionContext) => {
			this.actions.push(x)
		})
	}

	public async run (message: Message, _store: Store<{}>, logger: Logger): Promise<void> {
		const actionStr = message.asCommand().args[0]
		if (actionStr == null) {
			await message.reply('What should I lookup? Example: `:prefix:man help`')
			return
		}
		const action = this.actions.find((x) => x.name === actionStr)
		logger.debug(this.actions)
		if (action == null) {
			await message.reply(`\`:prefix:${actionStr}\` isn't an action`)
			return
		}
		if (action.man == null) {
			await message.reply(`\`:prefix:${action.name}\`:\n**Description:**\t${action.description}\n`)
		} else {
			await message.reply(`\`:prefix:${action.name}\`:\n**Description:**\t${action.description}\n**Usage:**\t${action.man}`)
		}
	}
}
