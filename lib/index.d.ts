import { Client, Message, PartialMessage } from 'discord.js';
import { Logger } from 'winston';
import { IDiscordBotConfig } from './config';
import { IAction, IDiscordBot, IMiddleware } from './foundation';
import { PrivateData } from './storage';
export { IAction, ActionContext, IMiddleware, IDiscordBot, ArmoredMessage as Message, ArmoredUser as User, Command } from './foundation';
export { PrivateStorage as Store } from './storage';
export { Logger } from 'winston';
export declare class DiscordBot implements IDiscordBot {
    readonly config: {
        [key: string]: any;
    };
    readonly log: Logger;
    readonly client: Client;
    readonly adminRole: string;
    readonly prefix: string;
    private readonly actions;
    private readonly middleware;
    private readonly store;
    private readonly token;
    private readonly formatter;
    private readonly emitter;
    constructor(options: IDiscordBotConfig);
    listActions(): string[];
    listMiddlewares(): string[];
    logout(): Promise<void>;
    start(): Promise<void>;
    runAction(msg: Message | PartialMessage): Promise<void>;
    loadActions<T extends PrivateData>(...actionsParam: Array<IAction<T>>): void;
    loadMiddleware<T extends PrivateData>(...middlewareParam: Array<IMiddleware<T>>): void;
    private initStorage;
    private initMiddlewares;
    private initActions;
    private init;
    private applyMiddleware;
}
//# sourceMappingURL=index.d.ts.map