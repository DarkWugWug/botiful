import { IAction, Logger, Message, Store } from './'
import { ActionContext } from './foundation'

export class HelpAction implements IAction<{}> {
	public readonly name = 'help'
	public readonly description =
		'Displays a list of all commands available to you'

	public readonly admin = false

	private helpString: string

	constructor (actionList: ActionContext[]) {
		this.helpString = this.parseHelpString(actionList)
	}

	public async run (
		message: Message,
		_store: Store<{}>,
		_logger: Logger
	): Promise<void> {
		await message.reply(this.helpString)
	}

	public replaceActionList (actionList: ActionContext[]): void {
		this.helpString = this.parseHelpString(actionList)
	}

	private parseHelpString (actionList: ActionContext[]): string {
		return actionList
			.map((x) => `**${`:prefix:${x.name}`}**: ${x.description}`)
			.join('\n\n')
	}
}

export class ManCommand implements IAction<{}> {
	public readonly name = 'man'
	public readonly description =
		'Displays the manual entry for an action'

	public readonly man = '!man <command>'
	public readonly admin = false

	private actions: ActionContext[]

	constructor (actions: ActionContext[]) {
		this.actions = actions
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

	public replaceActionList (actions: ActionContext[]): void {
		this.actions = actions
	}
}
