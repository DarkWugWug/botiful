"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
describe('Command Parsing', () => {
    it('should parse command name', () => {
        const validPrefixes = [
            '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=',
            '+', '{', '}', '[', ']', '|', '\\', '\'', ':', ';', '?', '/', '>', '.',
            '<', ',', 'a', 'A', '0', '9'
        ];
        const validPhrases = [
            ['', ''],
            ['cmd', 'cmd'],
            ['nightly-kinds', 'nightly-kinds'],
            ['cmd nightly-kinds', 'cmd'],
            ['nightly-kinds cmd', 'nightly-kinds'],
            ['something~REALLY👌#ugly', 'something~REALLY👌#ugly']
        ];
        for (const prefix of validPrefixes) {
            for (const [phrase, word] of validPhrases) {
                const command = new __1.Command(`${prefix}${phrase}`);
                expect(command.command).toBe(word);
            }
        }
    });
    it('should parse command args', () => {
        const validPhrases = [
            { input: '!', args: [] },
            { input: '!cmd one two', args: ['one', 'two'] },
            { input: '?cmd "one"', args: ['one'] },
            { input: '%nightly-kinds "input number one" two', args: ['input number one', 'two'] },
            { input: '#yes https://www.example.net/aunt/bit.php "like this"', args: ['https://www.example.net/aunt/bit.php', 'like this'] }
        ];
        for (const { input, args } of validPhrases) {
            const command = new __1.Command(input);
            expect(command.args).toEqual(args);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9jb21tYW5kLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFFNUIsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBR3BDLE1BQU0sYUFBYSxHQUFHO1lBQ3JCLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUN6RSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUN0RSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7U0FDNUIsQ0FBQTtRQUNELE1BQU0sWUFBWSxHQUFHO1lBQ3BCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNSLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztZQUNkLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQztZQUNsQyxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQztZQUM1QixDQUFDLG1CQUFtQixFQUFFLGVBQWUsQ0FBQztZQUN0QyxDQUFDLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDO1NBQ3RELENBQUE7UUFDRCxLQUFLLE1BQU0sTUFBTSxJQUFJLGFBQWEsRUFBRTtZQUNuQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksWUFBWSxFQUFFO2dCQUMxQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQU8sQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFBO2dCQUNqRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUNsQztTQUNEO0lBQ0YsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLE1BQU0sWUFBWSxHQUFHO1lBQ3BCLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO1lBQ3hCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDL0MsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLEVBQUUsS0FBSyxFQUFFLHVDQUF1QyxFQUFFLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3JGLEVBQUUsS0FBSyxFQUFFLHVEQUF1RCxFQUFFLElBQUksRUFBRSxDQUFDLHNDQUFzQyxFQUFFLFdBQVcsQ0FBQyxFQUFFO1NBQy9ILENBQUE7UUFDRCxLQUFLLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksWUFBWSxFQUFFO1lBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ2xDO0lBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQSJ9