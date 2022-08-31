import { createLogger, format, Logger, LoggerOptions, transports } from 'winston'
import { ensureFileSync } from 'fs-extra'
import { IDiscordBotConfigComplete } from './config'

const { combine, colorize, timestamp, align, printf, prettyPrint } = format

export function initLogger (config: IDiscordBotConfigComplete): Logger {
	const loggerOptions: LoggerOptions = {
		format: combine(
			colorize(),
			// Adds .timestamp property
			// https://github.com/winstonjs/logform#timestamp
			timestamp(),
			align(),
			printf((info) => `[${info.timestamp as string}] [${info.level}]: ${info.message as string}`)
		),
		level: config.loggerLevel,
		transports: []
	}
	if (config.loggerOutput === 'console') {
		loggerOptions.transports = new transports.Console()
	} else {
		ensureFileSync(config.loggerOutput)
		loggerOptions.transports = new transports.File({ filename: config.loggerOutput })
	}
	return createLogger(loggerOptions)
}
