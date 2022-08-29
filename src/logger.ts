import { createLogger, format, Logger, LoggerOptions, transports } from "winston";
import { ensureFileSync } from "fs-extra";

import { IDiscordBotConfigComplete } from "./config";

const { MESSAGE } = require("triple-beam");



function formatNow(): string {
    const dt = new Date();
    // return `${dt.getMonth()}/${dt.getDate()}/${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`;
    return dt.toLocaleString();
}

export const botFormat = format((info) => {
    const message = typeof info.message === "string"
        ? info.message
        : '\n' + JSON.stringify(info.message, null, 4);
    info[MESSAGE] = `${formatNow()} [${info.level}]: ${message}`;
    return info;
});

export function initLogger(config: IDiscordBotConfigComplete): Logger
{
    const logger_options: LoggerOptions = {
        format: botFormat(),
        level: config.loggerLevel,
        transports: [  ],
    };
    if(config.loggerOutput === "console") {
        logger_options.transports = new transports.Console();
    } else {
        ensureFileSync(config.loggerOutput);
        logger_options.transports = new transports.File({ filename: config.loggerOutput });
    }
    return createLogger(logger_options);
}
