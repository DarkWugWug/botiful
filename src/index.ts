import { Logger } from "winston";
import { Client, Message, PartialMessage } from "discord.js";
import persist, { LocalStorage } from "node-persist";

import { IDiscordBotConfig, getCompleteConfig } from "./config";
import { IAction, ActionMap, IMiddleware, IDiscordBot, SemiPartialMessage, MiddlewareMap, ActionRun } from "./foundation";
import { initLogger } from "./logger";

import { helpCommand, manCommand } from "./actions";
import { adminMiddleware, rolesMiddleware, usersMiddleware } from "./middleware";

// TESting
export * from "./foundation";

export class DiscordBot implements IDiscordBot
{
    public readonly config: { [key: string]: any };
    public readonly log: Logger;
    public readonly client: Client;
    public readonly adminRole: string;
    public readonly prefix: string;

    private _actions: ActionMap = {  };
    private _middlewares: MiddlewareMap = {   };
    private store: LocalStorage;
    private readonly token: string;

    public constructor(options: IDiscordBotConfig)
    {
        const config = getCompleteConfig(options);

        this.log = initLogger(config);
        this.config = config.data;
        this.prefix = config.prefix;
        this.token = config.token;
        this.adminRole = config.admin;
        this.client = new Client({
            intents: config.intents
        });
        this.store = persist;
    }
    public getAction(command: string) { return this._actions[command]; }
    public getActions() { return Object.values(this._actions); }

    public getMiddleware(name: string) { return this._middlewares[name]; }
    public getMiddlewares() { return Object.values(this._middlewares) }

    public async logout()
    {
        this.log.debug("Bot shutting down...");
        return Promise.all(this.getActions()
                .filter(action => action.cleanup)
                .map(action => (action.cleanup as () => void | Promise<void>)())
            )
            .then(() => this.client.destroy())
            .then(() => this.log.info("Bot logged out!"));
    }



    public async start(): Promise<void>
    {
        await this.init();
        this.log.info("Starting Discord Bot...");

        if(this.token.length === 0) { this.log.error("No token found!"); }
        return this.client.login(this.token).then(() => {
            this.log.info(`${this.client.user?.username} has logged in and started!`);
        }).catch((err) => { this.log.error(err); });
    }

    public async runAction(msg: Message | PartialMessage): Promise<void>
    {
        if(!msg.content || !msg.author) { return; }
        if(!msg.content.startsWith(this.prefix)
            || msg.author.equals(this.client.user!)) { return; }

        const cmd_regex = /("[^"]*"|\S+)/g;
        let cmd_args = (msg.content.match(cmd_regex) || [  ])
            .map((arg) => /^".*"$/.test(arg)
                ? arg.substring(1, arg.length - 2)
                : arg);
        const cmd = cmd_args[0].substring(1);
        cmd_args = cmd_args.slice(1);

        let reply = `'${cmd}' is not a valid command!`;
        const cmd_action = this._actions[cmd];
        if(cmd_action)
        {
            const authorized = await this.isAuthorized(cmd_action, msg as SemiPartialMessage);
            if(authorized)
            {
                const str = await cmd_action.run(cmd_args, msg as SemiPartialMessage, this);
                reply = (str && (str.length > 0)) ? str : "";
            }
            else
            {
                reply = "You are not authorized to use this command!";
            }
        }
        if(reply.length > 0) { msg.channel.send(reply); }
    }

    public loadActions(actions: IAction[]): void;
    public loadActions(action_map: { [name: string]: IAction }): void;
    public loadActions(actions_param: { [name: string]: IAction } | IAction[] | IAction): void
    {
        if(actions_param instanceof Array) {
            actions_param.forEach((action) => { this._actions[action.name] = action; })
        } else if(typeof actions_param === "object") {
            Object.assign(this._actions, actions_param);
        }
    }

    public loadMiddleware(middleware: IMiddleware): void;
    public loadMiddleware(middleware: IMiddleware[]): void;
    public loadMiddleware(middleware_param: IMiddleware | IMiddleware[]): void
    {
        if(middleware_param instanceof Array) {
            middleware_param.forEach((middleware) => {
                this._middlewares[middleware.name] = middleware
            });
        } else {
            this._middlewares[middleware_param.name] = middleware_param;
        }
    }

    private async initStorage() {
        await this.store.init({ dir: "./data" });
        this.log.info("Initialized data store");
    }

    private async initMiddlewares() {
        const botifulMiddleware = [adminMiddleware, rolesMiddleware, usersMiddleware];
        this.loadMiddleware(botifulMiddleware);
        this.log.debug(`Loaded all middlewares: [ ${this.getMiddlewares().join(", ")} ]`);
        const middlewaresWithInit = this.getMiddlewares()
            .reduce((collect, mw) => {
                if (mw.init) { collect.push(mw.init) }
                return collect;
            }, [] as Array<IMiddleware["init"]>);
        await Promise.all(middlewaresWithInit);
        this.log.debug(
            `Initialized middlewares: [ ${middlewaresWithInit.join(", ")} ]`
        );
    }

    private async initActions() {
        const botifulActions = [ helpCommand, manCommand ];
        this.loadActions(botifulActions);
        this.log.debug(`Loaded all actions: [ ${this.getActions().join(', ')} ]`);
        const actionsWithInit = this.getActions()
            .reduce((collect, action) => {
                if (action.init) collect.push(action.init);
                return collect;
            }, [] as Array<IAction["init"]>);
        await Promise.all(actionsWithInit);
        this.log.debug(
            `Initialized actions: [ ${actionsWithInit.join(", ")} ]`
        );
    }

    private async init(): Promise<void>
    {
        await this.initStorage();
        await Promise.all([
            this.initMiddlewares(),
            this.initActions(),
        ]);
        this.client.on("messageCreate", (msg) => this.runAction(msg));
        this.client.on("messageUpdate", (oldMsg, newMsg) => {
            if((oldMsg.content === newMsg.content)
                || (newMsg.embeds && !oldMsg.embeds)
                || (newMsg.embeds.length > 0 && oldMsg.embeds.length === 0)) { return; }
            this.runAction(newMsg);
        });
    }

    private async isAuthorized(action: IAction, message: SemiPartialMessage): Promise<boolean>
    {
        for(const mw of this.getMiddlewares())
        {
            if(!(await mw.apply(action, message, this))) {
                return false;
            }
        }
        return true;
    }
}
