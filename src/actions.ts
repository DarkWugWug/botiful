import { IAction } from "./foundation";



export const helpCommand: IAction =
{
    name: "help",
    description: "Displays a list of all commands available to you",
    admin: false,
    run: (_args, _msg, bot) => {
        return bot.getActions().map((action) => `${action.name} : ${action.description}`).join('\n');
    }
};

export const manCommand: IAction =
{
    name: "man",
    description: "Displays the manual entry for a specified command",
    man: "!man <command>",
    admin: false,
    run: (args, msg, bot) => {
        if(!args[0]) {
            msg.channel.send("You must pass in a command to look up the manual entry for.");
            return;
        }
        const command = bot.getAction(args[0]);
        if(!command) {
            msg.channel.send(`Could not find the command '${args[0]}'.`);
            return;
        }
        if(!command.man) {
            msg.channel.send(`The '${args[0]}' command does not have a manual entry.`);
            return;
        }
        msg.channel.send(command.man);
    }
};
