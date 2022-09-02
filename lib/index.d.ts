import { GatewayIntentsString as Intent } from 'discord.js';
import { Logger } from 'winston';
import { ActionContext, ArmoredClient, IAction, IDiscordBot, IMiddleware } from './foundation';
import { PrivateData } from './storage';
import { Formatter } from './utils';
export { Logger } from 'winston';
export { ActionContext, ArmoredClient as Client, ArmoredMessage as Message, ArmoredUser as User, Command, IAction, IDiscordBot, IMiddleware } from './foundation';
export { VoicePresence } from './voice';
export { PrivateStorage as Store } from './storage';
export { GatewayIntentsString as Intent } from 'discord.js';
export { Formatter, UsageBuilder } from './utils';
export interface BotifulOptions {
    prefix?: string;
    dataDir?: string;
}
export declare class DiscordBot implements IDiscordBot {
    readonly adminRole: string;
    readonly prefix: string;
    readonly formatter: Formatter;
    readonly client: ArmoredClient;
    private readonly _client;
    private readonly actions;
    private readonly middleware;
    private readonly store;
    private readonly emitter;
    static MakeBotiful(authToken: string, intents: Intent[], logger?: Logger, options?: BotifulOptions): Promise<DiscordBot>;
    private constructor();
    getActions(): ActionContext[];
    getMiddleware(): string[];
    registerAction<T extends PrivateData>(...actionList: Array<IAction<T>>): Promise<void>;
    registerMiddleware<T extends PrivateData>(...middlewareList: Array<IMiddleware<T>>): Promise<void>;
    private runAction;
    private registerDefaultSignalHandlers;
    private loadStorage;
    private isAuthorized;
}
//# sourceMappingURL=index.d.ts.map