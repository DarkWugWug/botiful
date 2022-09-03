/**
	* Use top-level Botiful exports as this isn't a part of the library in its
	* purest form, per-se
	*/
import { IAction, Message, Store, ActionContext, Formatter, UsageBuilder, DiscordBotEventEmitter } from '..'

export class HelpAction implements IAction<{}> {
	public readonly name = 'help'

	public readonly description =
		'Serves you this text. Can also be given another action\'s name to give usage information.'

	public readonly usage = new UsageBuilder(this.name)
		.whenGiven()
		.will('Respond with a list of every action with its description')
		.whenGiven('exampleAction')
		.will('Respond with just the description and usage examples for `exampleAction`')

	public readonly admin = false
	private readonly formatter: Formatter
	private readonly actions: ActionContext[] = []

	constructor (formatter: Formatter, emitter: DiscordBotEventEmitter, current?: ActionContext[]) {
		if (current != null) this.actions.push(...current)
		this.formatter = formatter
		emitter.on('register:action', (x: ActionContext) => {
			this.actions.push(x)
		})
	}

	public async run (
		message: Message,
		_store: Store<{}>
	): Promise<void> {
		const actionStr = message.asCommand().args[0]
		if (actionStr == null) {
			await message.reply(this.parseHelpString(this.actions))
			return
		}
		const queriedAction = this.actions.find((x) => x.name === actionStr)
		if (queriedAction == null) {
			await message.reply(`\`:prefix:${actionStr}\` isn't an action`)
			return
		}
		if (queriedAction.usage == null) {
			await message.reply(`\`:prefix:${queriedAction.name}\`:\n**Description:**\t${queriedAction.description}\n`)
		} else {
			await message.reply(
				{ embeds: [queriedAction.usage._format(this.formatter)] }
			)
		}
	}

	private parseHelpString (actionList: ActionContext[]): string {
		const header = '**Actions:**\n\n'
		const actionsText = actionList
			.map((x) => `${`\`:prefix:${x.name}\``}: ${x.description}`)
			.join('\n\n')
		return header + actionsText
	}
}
