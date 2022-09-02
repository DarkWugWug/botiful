export interface IBotifulConfig {
	token: string
	intents: number[]
	prefix?: string
	admin?: string
	environment?: string
	loggerLevel?: string
	loggerOutput?: string
	dataPath?: string
}

export const defaultConfig: IBotifulConfig = {
	token: 'REPLACE_ME',
	intents: [1, 512],
	prefix: '!',
	admin: 'Discord Admin',
	environment: process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV,
	loggerLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	loggerOutput: 'console',
	dataPath: 'data'
}
