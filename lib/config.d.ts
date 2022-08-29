export interface IDiscordBotConfig {
    token: string;
    intents: number[];
    prefix?: string;
    admin?: string;
    environment?: string;
    loggerLevel?: string;
    loggerOutput?: string;
    data?: {
        [key: string]: any;
    };
}
export interface IDiscordBotConfigComplete extends IDiscordBotConfig {
    prefix: string;
    admin: string;
    environment: string;
    loggerLevel: string;
    loggerOutput: string;
    data: {
        [key: string]: any;
    };
}
export declare const default_config: Omit<IDiscordBotConfigComplete, "token" | "intents">;
export declare function getCompleteConfig(config: IDiscordBotConfig): IDiscordBotConfigComplete;
//# sourceMappingURL=config.d.ts.map