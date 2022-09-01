/// <reference types="node" />
/// <reference types="node" />
import { Client, ColorResolvable, GuildMember, Message, PartialMessage, User } from 'discord.js';
import { LocalStorage } from 'node-persist';
import { Logger } from 'winston';
import { PlayerSubscription, StreamType } from '@discordjs/voice';
import { PrivateData, PrivateStorage } from './storage';
import { Formatter } from './utils';
import { EventEmitter, Readable } from 'stream';
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
    init?: (privateData: PrivateStorage<T>, logger: Logger, client: ArmoredClient) => void | Promise<void>;
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
    init?: (privateData: PrivateStorage<T>, logger: Logger, client: ArmoredClient) => {};
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
    asCommand(): Command;
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
    joinInVoice(selfDeaf?: boolean, selfMute?: boolean): Promise<VoicePresence>;
    isInVoiceChannel(): boolean;
}
export declare class ArmoredClient {
    private readonly client;
    constructor(client: Client);
    guildsHaveRole(role: string): boolean;
    createRoleInGuilds(name: string, color?: ColorResolvable, mentionable?: boolean): Promise<void>;
}
export declare class Command {
    readonly command: string;
    readonly args: string[];
    constructor(stdin: string);
}
export declare class VoicePresence extends EventEmitter {
    private readonly subscription;
    private volume?;
    constructor(subscription: PlayerSubscription);
    pause(): void;
    resume(): void;
    stopTransmitting(): void;
    startTransmitting(stream: string | Readable, format?: StreamType): void;
    getVolume(): number;
    setVolume(db: number): void;
    private getResourceVolumeTransformer;
    private setResourceVolume;
}
//# sourceMappingURL=foundation.d.ts.map