import { Command } from '..'

describe('Command Parsing', () => {
	it('should parse', () => {
		const test = (phrase: string, word: string): void => {
			const command = new Command(phrase)
			expect(command.command).toBe(word)
		}
		// Note: does not need double-quote literal support, "
		// Note: does not need unicode emoji support
		const validPrefixes = [
			'~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=',
			'+', '{', '}', '[', ']', '|', '\\', '\'', ':', ';', '?', '/', '>', '.',
			'<', ',', 'a', 'A', '0', '9'
		]
		const validPhrases = [
			['cmd', 'cmd'],
			['nightly-kinds', 'nightly-kinds'],
			['cmd nightly-kinds', 'cmd'],
			['nightly-kinds cmd', 'nightly-kinds'],
			['somthing~REALLY👌#ugly', 'somthing~REALLY👌#ugly']
		]
		for (const prefix of validPrefixes) {
			for (const [phrase, word] of validPhrases) {
				test(`${prefix}${phrase}`, word)
			}
		}
	})
})
