import { Client, Message, PartialMessage, User } from "discord.js";
import { LocalStorage } from "node-persist";
import { Logger } from "winston";

import {
	createAudioPlayer, DiscordGatewayAdapterCreator, joinVoiceChannel, PlayerSubscription
} from "@discordjs/voice";

import { PrivateData, PrivateStorage } from "./storage";
import { doTyping, Formatter } from "./utils";

export interface IDiscordBot {
    readonly log: Logger;
    readonly client: Client;
    readonly adminRole: string;
    readonly prefix: string;

    listActions(): Array<string>;
    listMiddlewares(): Array<string>;
}

export interface IAction<T extends PrivateData> {
    readonly name: string;
    readonly description: string;
    readonly man?: string;
    readonly defaults?: T;

    readonly admin: boolean;
    readonly roles?: string[];
    readonly users?: string[];

    init?: (
        privateData: PrivateStorage<T>,
        logger: Logger
    ) => void | Promise<void>;
    run: (
        message: ArmoredMessage,
        privateData: PrivateStorage<T>,
        logger: Logger
    ) => void | Promise<void>;
}
export class ArmoredAction<T extends PrivateData> {
    public readonly name: string;
    private clientAction: IAction<T>;
    private db: PrivateStorage<T>;
    private logger: Logger;
    private discordClient: ArmoredClient;

    constructor(
        clientAction: IAction<T>,
        db: LocalStorage,
        logger: Logger,
        client: ArmoredClient
    ) {
        this.name = clientAction.name;
        this.clientAction = clientAction;
        const privateStorage = new PrivateStorage<T>(
            db,
            `botiful:${this.name}`
        );
        if (clientAction.defaults)
            privateStorage._gentlyApplyDefaults(clientAction.defaults as T);
        this.db = privateStorage;
        this.logger = logger;
        this.discordClient = client;
    }

    public async initializeClient() {
        if (this.clientAction.init)
            await this.clientAction.init(this.db, this.logger);
    }

    public async runClient(message: ArmoredMessage) {
        await this.clientAction.run(message, this.db, this.logger);
    }

    public asContext(): ActionContext {
        return {
            name: this.clientAction.name,
            description: this.clientAction.description,
            man: this.clientAction.man,
            admin: this.clientAction.admin,
            roles: this.clientAction.roles,
            users: this.clientAction.users
        }
    }
}

export type ActionContext = Pick<
    IAction<any>,
    "name" | "description" | "man" | "admin" | "roles" | "users"
>;

export interface IMiddleware<T extends PrivateData> {
    readonly name: string;
    readonly defaults?: T;

    init?(privateData: PrivateStorage<T>, logger: Logger): {};

    apply(
        context: ActionContext,
        message: ArmoredMessage,
        privateData: PrivateStorage<T>,
        logger: Logger
    ): boolean | Promise<boolean>;
}
export class ArmoredMiddleware<T extends PrivateData> {
    public readonly name: string;
    private clientMiddleware: IMiddleware<T>;
    private db: PrivateStorage<T>;
    private logger: Logger;
    private discordClient: ArmoredClient;

    constructor(
        clientMiddleware: IMiddleware<T>,
        db: LocalStorage,
        logger: Logger,
        client: ArmoredClient
    ) {
        this.name = clientMiddleware.name;
        this.clientMiddleware = clientMiddleware;
        const privateStorage = new PrivateStorage<T>(
            db,
            `botiful:${this.name}`
        );
        if (clientMiddleware.defaults)
            privateStorage._gentlyApplyDefaults(clientMiddleware.defaults as T);
        this.db = privateStorage;
        this.logger = logger;
        this.discordClient = client;
    }

    public async initializeClient() {
        if (this.clientMiddleware.init)
            await this.clientMiddleware.init(this.db, this.logger);
    }

    public async applyClient(action: ActionContext, message: ArmoredMessage) {
        return await this.clientMiddleware.apply(
            action,
            message,
            this.db,
            this.logger
        );
    }
}

export class ArmoredMessage {
    public author: ArmoredUser;
    public fromGuildOwner?: boolean;
    public guildId?: string;
    public mentionedUsers: Array<ArmoredUser>;
    public content: string;

    private message: Message | PartialMessage;
    private formatter: Formatter;

    constructor(message: Message | PartialMessage, formatter: Formatter) {
        if (!message.content || !message.author)
            throw new Error(`Message doesn't have content or author`);
        this.author = new ArmoredUser(message.author);
        this.mentionedUsers = message.mentions.users.map(
            (x) => new ArmoredUser(x)
        );
        this.guildId = message.guildId || undefined;
        this.fromGuildOwner = message.guild?.ownerId == this.author.id;
        this.content = message.content;

        this.message = message;
        this.formatter = formatter;
    }

    public respond(response: string) {
        const channel = this.message.channel;
        doTyping(channel, 500);
        channel.send(this.formatter.fmt(response));
    }

    public reply(response: string) {
        doTyping(this.message.channel, 500);
        this.message.reply(this.formatter.fmt(response));
    }

    public async tryJoinAuthorInVoice(
        selfDeaf = true,
        selfMute = false
    ): Promise<PlayerSubscription> {
        if (!this.message.member)
            throw this.dispatchError(
                `${this.author.username} isn't a member of this server`
            );
        if (
            !this.message.member.voice.channel ||
            !this.message.member.voice.channelId
        )
            throw this.dispatchError(
                `${this.author.username} isn't in a voice channel`
            );
        if (!this.message.guild || !this.guildId)
            throw this.dispatchError(
                `Hmmm... you didn't send this in a server. I can only join server voice chats.`
            );
        const memberVoice = this.message.member.voice; // The checks above should ensure this exists
        const player = createAudioPlayer();
        try {
            const voiceConnection = joinVoiceChannel({
                guildId: this.guildId,
                channelId: memberVoice.id,
                adapterCreator:
                    // https://discordjs.guide/voice/voice-connections.html#creation
                    this.message.guild
                        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
                selfDeaf,
                selfMute,
            });
            return new PlayerSubscription(voiceConnection, player);
        } catch (err) {
            throw this.dispatchError(
                `I was looking for '${this.message.member.voice.channel.name}', but couldn't find it. Can :adminRole: help us?`
            );
        }
    }

    public authorHasRole(role: string) {
        if (!this.message.member)
            throw this.dispatchError(
                `${this.author.username} isn't a member of this server`
            );
        return this.message.member.roles.cache.has(role);
    }

    public authorHasAnyRole(role: string | string[]) {
        if (!this.message.member)
            throw this.dispatchError(
                `${this.author.username} isn't a member of this server`
            );
        return this.message.member.roles.cache.hasAny(...role);
    }

    private dispatchError(text: string) {
        this.reply(text);
        return new Error(text);
    }
}

export class ArmoredUser {
    public username: string;
    public id: string;
    public tag: string;

    constructor(user: User) {
        this.username = user.username;
        this.id = user.id;
        this.tag = user.tag;
    }
}

// TODO: Currently there are no use-cases for exposing any feature of the
//       DiscordJS client. When they manifest, add them here. This ensures a
//       level-of-control between clients and the DiscordJS client.
export class ArmoredClient {
    constructor(_client: Client) {}
}
