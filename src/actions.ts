import { IAction, Logger, Message, Store } from "./";
import { ActionContext } from "./foundation";

export type HelpData = {};
export class HelpAction implements IAction<HelpData> {
    public readonly name = "help";
    public readonly description =
        "Displays a list of all commands available to you";
    public readonly admin = false;

    private helpString: string;

    constructor(actionList: Array<ActionContext>) {
        this.helpString = this.parseHelpString(actionList);
    }

    public async run(
        message: Message,
        _store: Store<HelpData>,
        _logger: Logger
    ) {
        message.reply(this.helpString);
    }

    public replaceActionList(actionList: Array<ActionContext>) {
        this.helpString = this.parseHelpString(actionList);
    }

    private parseHelpString(actionList: Array<ActionContext>): string {
        return actionList
            .map((x) => `**${`:prefix:${x.name}`}**: ${x.description}`)
            .join("\n\n");
    }
}

export type ManData = {};
export class ManCommand implements IAction<ManData> {
    public readonly name = "man";
    public readonly description =
        "Displays the manual entry for a specified command";
    public readonly man = "!man <command>";
    public readonly admin = false;

    public async run() {
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
}
