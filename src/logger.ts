import { createLogger, format, Logger, LoggerOptions, transports } from 'winston'
import { TransformableInfo } from 'logform'
import { ensureFileSync } from 'fs-extra'

import { IDiscordBotConfigComplete } from './config'

function formatNow (): string {
	const dt = new Date()
	return dt.toLocaleString()
}

function botifulFormat (info: TransformableInfo, opts?: any): TransformableInfo | boolean {
	const message = typeof info.message === 'string'
		? info.message
		: '\n' + JSON.stringify(info.message, null, 2)
	info.message = `${formatNow()} [${info.level}]: ${message}`
	return info
}

export function initLogger (config: IDiscordBotConfigComplete): Logger {
	const loggerOptions: LoggerOptions = {
		format: format(botifulFormat)(),
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
