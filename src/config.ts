


export interface IDiscordBotConfig
{
    token: string;
    intents: number[];
    prefix?: string;
    admin?: string;
    environment?: string;
    loggerLevel?: string;
    loggerOutput?: string;
    data?: { [key: string]: any }
}
export interface IDiscordBotConfigComplete extends IDiscordBotConfig
{
    prefix: string;
    admin: string;
    environment: string;
    loggerLevel: string;
    loggerOutput: string;
    data: { [key: string]: any };
}
export const default_config: Omit<IDiscordBotConfigComplete, "token" | "intents"> = {
    prefix: '!',
    admin: "Discord Admin",
    environment: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
    loggerLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
    loggerOutput: "console",
    data: {  }
};

function verifyConfig(config: any) {
    if(typeof config.token !== "string") {
        throw new Error(`Expected Discord token in config, but found '${config.token}'`);
    }
    if(!Array.isArray(config.intents)) {
        throw new Error("Could not find intents for the bot to use.");
    }
}
export function getCompleteConfig(config: IDiscordBotConfig): IDiscordBotConfigComplete
{
    verifyConfig(config);
    return { ...default_config, ...config };
}
