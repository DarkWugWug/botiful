import { Client, GuildMember, Message, PartialMessage, User } from 'discord.js';
import { LocalStorage } from 'node-persist';
import { Logger } from 'winston';
import { PlayerSubscription } from '@discordjs/voice';
import { PrivateData, PrivateStorage } from './storage';
import { Formatter } from './utils';
export interface IDiscordBot {
    readonly log: Logger;
    readonly client: Client;
    readonly adminRole: string;
    readonly prefix: string;
    listActions: () => string[];
    listMiddlewares: () => string[];
}
export interface IAction<T extends PrivateData> {
    readonly name: string;
    readonly description: string;
    readonly man?: string;
    readonly defaults?: T;
    readonly admin: boolean;
    readonly roles?: string[];
    readonly users?: string[];
    init?: (privateData: PrivateStorage<T>, logger: Logger) => void | Promise<void>;
    run: (message: ArmoredMessage, privateData: PrivateStorage<T>, logger: Logger) => void | Promise<void>;
}
export declare class ArmoredAction<T extends PrivateData> {
    readonly name: string;
    private readonly clientAction;
    private readonly db;
    private readonly logger;
    private readonly discordClient;
    constructor(clientAction: IAction<T>, db: LocalStorage, logger: Logger, client: ArmoredClient);
    initializeClient(): Promise<void>;
    runClient(message: ArmoredMessage): Promise<void>;
    asContext(): ActionContext;
}
export declare type ActionContext = Pick<IAction<any>, 'name' | 'description' | 'man' | 'admin' | 'roles' | 'users'>;
export interface IMiddleware<T extends PrivateData> {
    readonly name: string;
    readonly defaults?: T;
    init?: (privateData: PrivateStorage<T>, logger: Logger) => {};
    apply: (context: ActionContext, message: ArmoredMessage, privateData: PrivateStorage<T>, logger: Logger) => boolean | Promise<boolean>;
}
export declare class ArmoredMiddleware<T extends PrivateData> {
    readonly name: string;
    private readonly clientMiddleware;
    private readonly db;
    private readonly logger;
    private readonly discordClient;
    constructor(clientMiddleware: IMiddleware<T>, db: LocalStorage, logger: Logger, client: ArmoredClient);
    initializeClient(): Promise<void>;
    applyClient(action: ActionContext, message: ArmoredMessage): Promise<boolean>;
}
export declare class ArmoredMessage {
    author: ArmoredUser;
    fromGuildOwner?: boolean;
    guildId?: string;
    mentionedUsers: ArmoredUser[];
    content: string;
    private readonly message;
    private readonly formatter;
    constructor(message: Message | PartialMessage, formatter: Formatter);
    respond(response: string): Promise<void>;
    reply(response: string): Promise<void>;
    tryJoinAuthorInVoice(selfDeaf?: boolean, selfMute?: boolean): Promise<PlayerSubscription>;
    authorHasRole(role: string): Promise<boolean>;
    authorHasAnyRole(role: string | string[]): Promise<boolean>;
    private dispatchError;
}
export declare class ArmoredUser {
    username: string;
    id: string;
    tag: string;
    member?: GuildMember;
    constructor(user: User, member?: GuildMember);
    hasRole(role: string): boolean;
    giveRole(role: string): Promise<void>;
    removeRole(role: string): Promise<void>;
}
export declare class ArmoredClient {
    constructor(_client: Client);
}
//# sourceMappingURL=foundation.d.ts.map