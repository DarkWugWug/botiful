import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js'

export class Formatter {
	static substitutions: Record<string, (self: Formatter) => string> = {
		':prefix:': (self) => self.prefix,
		':adminRole:': (self) => self.adminRole,
		':botName:': (self) => {
			if (self.client.user != null) {
				return self.client.user.username
			} else {
				return 'this bot'
			}
		}
	} as const

	constructor (
		private readonly prefix: string,
		private readonly adminRole: string,
		private readonly client: Client
	) {}

	public fmt (x: string): string {
		let formatStr = `${x}` // Read as "cloning" templateStr to formatStr
		for (const [pattern, write] of Object.entries(
			Formatter.substitutions
		)) {
			formatStr = formatStr.replaceAll(pattern, write(this))
		}
		return formatStr
	}
}

export async function doTyping (
	channel: TextBasedChannel,
	typing: number = 0
): Promise<void> {
	await channel.sendTyping()
	setTimeout(() => {}, typing)
}

interface UseCase {
	inputs: string[]
	description?: string
}

export class UsageBuilder {
	private readonly name: string
	private description?: string = undefined
	private readonly useCases: UseCase[] = []

	constructor (name: string) {
		this.name = name
	}

	public broadlySpeaking (desc: string): this {
		this.description = desc
		return this
	}

	public whenGiven (...inputs: string[]): this {
		this.useCases.push({ inputs })
		return this
	}

	public will (infoText: string): this {
		this.useCases[this.useCases.length - 1].description = infoText
		return this
	}

	public _format (f: Formatter): EmbedBuilder {
		const builder = new EmbedBuilder()
			.setColor('Greyple')
			.setTitle(`The ${this.name} action`)
		if (this.description != null) builder.setDescription(f.fmt(this.description))
		builder.addFields(
			this.useCases.map((x) => {
				if (x.description == null) x.description = ''
				const inputStr = x.inputs
					.map((x) => `\`${x}\``) // Make each input it's own codeblock by surrounding it with backticks
					.join(' ')
				const actionStr = `:prefix:${this.name}`
				return {
					name: f.fmt(actionStr + ' ' + inputStr),
					value: f.fmt(x.description)
				}
			})
		)
		builder.setTimestamp()
		builder.setFooter({ text: 'Botiful' })
		return builder
	}
}
