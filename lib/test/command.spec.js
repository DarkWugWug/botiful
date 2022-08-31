"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
describe('Command Parsing', () => {
    it('should parse', () => {
        const test = (phrase, word) => {
            const command = new __1.Command(phrase);
            expect(command.command).toBe(word);
        };
        const validPrefixes = [
            '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=',
            '+', '{', '}', '[', ']', '|', '\\', '\'', ':', ';', '?', '/', '>', '.',
            '<', ',', 'a', 'A', '0', '9'
        ];
        const validPhrases = [
            ['cmd', 'cmd'],
            ['nightly-kinds', 'nightly-kinds'],
            ['cmd nightly-kinds', 'cmd'],
            ['nightly-kinds cmd', 'nightly-kinds'],
            ['somthing~REALLY👌#ugly', 'somthing~REALLY👌#ugly']
        ];
        for (const prefix of validPrefixes) {
            for (const [phrase, word] of validPhrases) {
                test(`${prefix}${phrase}`, word);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9jb21tYW5kLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFFNUIsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxFQUFFLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUN2QixNQUFNLElBQUksR0FBRyxDQUFDLE1BQWMsRUFBRSxJQUFZLEVBQVEsRUFBRTtZQUNuRCxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuQyxDQUFDLENBQUE7UUFHRCxNQUFNLGFBQWEsR0FBRztZQUNyQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDekUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFDdEUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO1NBQzVCLENBQUE7UUFDRCxNQUFNLFlBQVksR0FBRztZQUNwQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDZCxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUM7WUFDbEMsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7WUFDNUIsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUM7WUFDdEMsQ0FBQyx3QkFBd0IsRUFBRSx3QkFBd0IsQ0FBQztTQUNwRCxDQUFBO1FBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxhQUFhLEVBQUU7WUFDbkMsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLFlBQVksRUFBRTtnQkFDMUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO2FBQ2hDO1NBQ0Q7SUFDRixDQUFDLENBQUMsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBIn0=