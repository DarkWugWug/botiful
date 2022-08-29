import { Logger } from "winston";
import { Client, Message, PartialMessage } from "discord.js";
export interface IDiscordBot {
    readonly config: {
        [key: string]: any;
    };
    readonly log: Logger;
    readonly client: Client;
    readonly adminRole: string;
    readonly prefix: string;
    getActions: () => IAction[];
    getAction: (command: string) => IAction | null;
}
export declare type SemiPartialMessage = PartialMessage & Pick<Message, "content" | "author">;
export declare type ActionMap = {
    [name: string]: IAction;
};
export declare type ActionRun = (args: string[], msg: Message | SemiPartialMessage, bot: IDiscordBot) => void | string | Promise<void> | Promise<string>;
export interface IAction {
    readonly name: string;
    description: string;
    man?: string;
    readonly admin: boolean;
    roles?: string[];
    users?: string[];
    state?: any;
    readonly init?: (bot: IDiscordBot) => void | Promise<void>;
    readonly run: ActionRun;
    readonly cleanup?: (bot: IDiscordBot) => void | Promise<void>;
}
export declare function verifyAction(maybe_action: any): boolean;
export declare function subcommand(subcmds: {
    [name: string]: ActionRun;
}): ActionRun;
export interface IMiddleware {
    readonly init?: (bot: IDiscordBot) => void | Promise<void>;
    readonly apply: (action: IAction, message: Message | SemiPartialMessage, bot: IDiscordBot) => boolean | Promise<boolean>;
}
export declare function verifyMiddleware(maybe_middleware: any): boolean;
