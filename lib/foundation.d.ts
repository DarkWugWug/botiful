import { Client, ColorResolvable, GuildMember, Message, MessageOptions, MessagePayload, PartialMessage, ReplyMessageOptions, User } from 'discord.js';
import { PrivateData, PrivateStorage } from './storage';
import { Formatter, UsageBuilder } from './utils';
import { VoicePresence } from './voice';
export interface IAction<T extends PrivateData> {
    readonly name: string;
    readonly description: string;
    readonly usage?: UsageBuilder;
    readonly defaults?: T;
    readonly admin: boolean;
    readonly roles?: string[];
    readonly users?: string[];
    init?: (privateData: PrivateStorage<T>, client: ArmoredClient) => Promise<void>;
    run: (message: ArmoredMessage, privateData: PrivateStorage<T>) => Promise<void>;
}
export declare class ArmoredAction<T extends PrivateData> {
    readonly name: string;
    private readonly clientAction;
    private readonly store;
    private readonly armoredClient;
    constructor(clientAction: IAction<T>, store: PrivateStorage<T>, client: ArmoredClient);
    initializeClient(): Promise<void>;
    runClient(message: ArmoredMessage): Promise<void>;
    asContext(): ActionContext;
}
export declare type ActionContext = Pick<IAction<any>, 'name' | 'description' | 'usage' | 'admin' | 'roles' | 'users'>;
export interface IMiddleware<T extends PrivateData> {
    readonly name: string;
    readonly defaults?: T;
    init?: (privateData: PrivateStorage<T>, client: ArmoredClient) => Promise<void>;
    apply: (context: ActionContext, message: ArmoredMessage, privateData: PrivateStorage<T>) => Promise<boolean>;
}
export declare class ArmoredMiddleware<T extends PrivateData> {
    readonly name: string;
    private readonly clientMiddleware;
    private readonly store;
    private readonly discordClient;
    constructor(clientMiddleware: IMiddleware<T>, store: PrivateStorage<T>, client: ArmoredClient);
    initializeClient(): Promise<void>;
    applyClient(action: ActionContext, message: ArmoredMessage): Promise<boolean>;
}
export declare class ArmoredMessage {
    author: ArmoredUser;
    fromGuildOwner?: boolean;
    guildId?: string;
    channelId: string;
    mentionedUsers: ArmoredUser[];
    content: string;
    private readonly message;
    private readonly formatter;
    constructor(message: Message | PartialMessage, formatter: Formatter);
    respond(x: string | MessagePayload | MessageOptions): Promise<void>;
    reply(x: string | MessagePayload | ReplyMessageOptions): Promise<void>;
    asCommand(): Command;
    private formatMessage;
}
export declare class ArmoredUser {
    username: string;
    id: string;
    tag: string;
    private readonly member?;
    constructor(user: User, member?: GuildMember);
    getRoles(): string[];
    hasRole(role: string): boolean;
    hasAnyRole(roles: string[]): boolean;
    giveRole(role: string): Promise<void>;
    removeRole(role: string): Promise<void>;
    joinInVoice(selfDeaf?: boolean, selfMute?: boolean): VoicePresence;
    isInVoiceChannel(): boolean;
}
export declare class ArmoredClient {
    private readonly client;
    constructor(client: Client);
    guildsHaveRole(role: string): Promise<boolean>;
    createRoleInGuilds(name: string, color?: ColorResolvable, mentionable?: boolean): Promise<void>;
}
export declare class Command {
    readonly command: string;
    readonly args: string[];
    constructor(stdin: string);
}
//# sourceMappingURL=foundation.d.ts.map