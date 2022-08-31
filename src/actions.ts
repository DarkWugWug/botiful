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
		'Displays the manual entry for a specified command'

	public readonly man = '!man <command>'
	public readonly admin = false

	private actions: ActionContext[]

	constructor (actions: ActionContext[]) {
		this.actions = actions
	}

	public async run (message: Message, store: Store<{}>, logger: Logger): Promise<void> {
		// if(!args[0]) {
		//     msg.channel.send("You must pass in a command to look up the manual entry for.");
		//     return;
		// }
		// const command = bot.getAction(args[0]);
		// if(!command) {
		//     msg.channel.send(`Could not find the command '${args[0]}'.`);
		//     return;
		// }
		// if(!command.man) {
		//     msg.channel.send(`The '${args[0]}' command does not have a manual entry.`);
		//     return;
		// }
		// msg.channel.send(format(command.man, bot));
	}

	public replaceActionList (actions: ActionContext[]): void {
		this.actions = actions
	}
}
