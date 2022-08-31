import { Command } from '..'

describe('Command Parsing', () => {
	it('should parse command name', () => {
		// Note: does not need double-quote literal support, "
		// Note: does not need unicode emoji support
		const validPrefixes = [
			'~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=',
			'+', '{', '}', '[', ']', '|', '\\', '\'', ':', ';', '?', '/', '>', '.',
			'<', ',', 'a', 'A', '0', '9'
		]
		const validPhrases = [
			['', ''],
			['cmd', 'cmd'],
			['nightly-kinds', 'nightly-kinds'],
			['cmd nightly-kinds', 'cmd'],
			['nightly-kinds cmd', 'nightly-kinds'],
			['something~REALLY👌#ugly', 'something~REALLY👌#ugly']
		]
		for (const prefix of validPrefixes) {
			for (const [phrase, word] of validPhrases) {
				const command = new Command(`${prefix}${phrase}`)
				expect(command.command).toBe(word)
			}
		}
	})

	it('should parse command args', () => {
		const validPhrases = [
			{ input: '!', args: [] },
			{ input: '!cmd one two', args: ['one', 'two'] },
			{ input: '?cmd "one"', args: ['one'] },
			{ input: '%nightly-kinds "input number one" two', args: ['input number one', 'two'] },
			{ input: '#yes https://www.example.net/aunt/bit.php "like this"', args: ['https://www.example.net/aunt/bit.php', 'like this'] }
		]
		for (const { input, args } of validPhrases) {
			const command = new Command(input)
			expect(command.args).toEqual(args)
		}
	})
})
