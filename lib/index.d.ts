import { Logger } from "winston";
import { Client, Message, PartialMessage } from "discord.js";
import { IDiscordBotConfig } from "./config";
import { IAction, IMiddleware, IDiscordBot } from "./foundation";
export * from "./foundation";
export declare class DiscordBot implements IDiscordBot {
    readonly config: {
        [key: string]: any;
    };
    readonly log: Logger;
    readonly client: Client;
    readonly adminRole: string;
    readonly prefix: string;
    private _actions;
    private _middlewares;
    private readonly token;
    constructor(options: IDiscordBotConfig);
    getAction(command: string): IAction;
    getActions(): IAction[];
    getMiddleware(name: string): IMiddleware;
    getMiddlewares(): IMiddleware[];
    logout(): Promise<Logger>;
    start(): Promise<void>;
    runAction(msg: Message | PartialMessage): Promise<void>;
    loadActions(actions: IAction[]): void;
    loadActions(action_map: {
        [name: string]: IAction;
    }): void;
    loadMiddleware(middleware: IMiddleware): void;
    loadMiddleware(middleware: IMiddleware[]): void;
    private init;
    private isAuthorized;
}
//# sourceMappingURL=index.d.ts.map