import { Logger } from "winston";
import { IDiscordBotConfigComplete } from "./config";
export declare const botFormat: import("logform").FormatWrap;
export declare function initLogger(config: IDiscordBotConfigComplete): Logger;
