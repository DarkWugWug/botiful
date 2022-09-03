import { GatewayIntentsString as Intent } from 'discord.js';
import EventEmitter from 'events';
import { Logger } from 'winston';
import { ActionContext, ArmoredClient, IAction, IMiddleware } from './foundation';
import { PrivateData } from './storage';
import { Formatter } from './utils';
export { GatewayIntentsString as Intent } from 'discord.js';
export { Logger } from 'winston';
export { ActionContext, ArmoredClient as Client, ArmoredMessage as Message, ArmoredUser as User, Command, IAction, IMiddleware } from './foundation';
export { PrivateStorage as Store } from './storage';
export { Formatter, UsageBuilder } from './utils';
export { VoicePresence } from './voice';
export interface BotifulOptions {
    prefix?: string;
    dataDir?: string;
    adminRole?: string;
}
export interface DiscordBotEvent {
    'register:action': (ctx: ActionContext) => void;
    'register:middleware': (name: string) => void;
}
export interface DiscordBotEventEmitter extends EventEmitter {
    on: <U extends keyof DiscordBotEvent>(event: U, listener: DiscordBotEvent[U]) => this;
    off: <U extends keyof DiscordBotEvent>(event: U, listener: DiscordBotEvent[U]) => this;
    emit: <U extends keyof DiscordBotEvent>(event: U, ...args: Parameters<DiscordBotEvent[U]>) => boolean;
}
export declare class DiscordBot {
    readonly formatter: Formatter;
    readonly client: ArmoredClient;
    readonly emitter: DiscordBotEventEmitter;
    readonly adminRole: string;
    readonly prefix: string;
    readonly dataDir: string;
    private readonly _client;
    private readonly actions;
    private readonly middleware;
    private readonly store;
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