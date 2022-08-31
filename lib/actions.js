"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManCommand = exports.HelpAction = void 0;
class HelpAction {
    constructor(actionList) {
        this.name = 'help';
        this.description = 'Displays a list of all commands available to you';
        this.admin = false;
        this.helpString = this.parseHelpString(actionList);
    }
    run(message, _store, _logger) {
        return __awaiter(this, void 0, void 0, function* () {
            yield message.reply(this.helpString);
        });
    }
    replaceActionList(actionList) {
        this.helpString = this.parseHelpString(actionList);
    }
    parseHelpString(actionList) {
        return actionList
            .map((x) => `**${`:prefix:${x.name}`}**: ${x.description}`)
            .join('\n\n');
    }
}
exports.HelpAction = HelpAction;
class ManCommand {
    constructor(actions) {
        this.name = 'man';
        this.description = 'Displays the manual entry for an action';
        this.man = '!man <command>';
        this.admin = false;
        this.actions = actions;
    }
    run(message, _store, _logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = message.asCommand().subcommand();
            if (command.command == null) {
                yield message.reply('What should I lookup? Example: `:prefix:man help`');
                return;
            }
            const action = this.actions.find((x) => x.name === command.command);
            if (action == null) {
                yield message.reply(`\`:prefix:${command.command}\` isn't an action`);
                return;
            }
            if (action.man == null) {
                yield message.reply(`\`:prefix:${action.name}\`:\n**Description:**\t${action.description}\n`);
            }
            else {
                yield message.reply(`\`:prefix:${action.name}\`:\n**Description:**\t${action.description}\n**Usage:**\t${action.man}`);
            }
        });
    }
    replaceActionList(actions) {
        this.actions = actions;
    }
}
exports.ManCommand = ManCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEsVUFBVTtJQVN0QixZQUFhLFVBQTJCO1FBUnhCLFNBQUksR0FBRyxNQUFNLENBQUE7UUFDYixnQkFBVyxHQUMxQixrREFBa0QsQ0FBQTtRQUVuQyxVQUFLLEdBQUcsS0FBSyxDQUFBO1FBSzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBRVksR0FBRyxDQUNmLE9BQWdCLEVBQ2hCLE1BQWlCLEVBQ2pCLE9BQWU7O1lBRWYsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyQyxDQUFDO0tBQUE7SUFFTSxpQkFBaUIsQ0FBRSxVQUEyQjtRQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVPLGVBQWUsQ0FBRSxVQUEyQjtRQUNuRCxPQUFPLFVBQVU7YUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNmLENBQUM7Q0FDRDtBQTlCRCxnQ0E4QkM7QUFFRCxNQUFhLFVBQVU7SUFVdEIsWUFBYSxPQUF3QjtRQVRyQixTQUFJLEdBQUcsS0FBSyxDQUFBO1FBQ1osZ0JBQVcsR0FDMUIseUNBQXlDLENBQUE7UUFFMUIsUUFBRyxHQUFHLGdCQUFnQixDQUFBO1FBQ3RCLFVBQUssR0FBRyxLQUFLLENBQUE7UUFLNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDdkIsQ0FBQztJQUVZLEdBQUcsQ0FBRSxPQUFnQixFQUFFLE1BQWlCLEVBQUUsT0FBZTs7WUFDckUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFBO1lBQ2hELElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7Z0JBQzVCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO2dCQUN4RSxPQUFNO2FBQ047WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDbkUsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUNuQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxPQUFPLENBQUMsT0FBTyxvQkFBb0IsQ0FBQyxDQUFBO2dCQUNyRSxPQUFNO2FBQ047WUFDRCxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxNQUFNLENBQUMsSUFBSSwwQkFBMEIsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUE7YUFDN0Y7aUJBQU07Z0JBQ04sTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsTUFBTSxDQUFDLElBQUksMEJBQTBCLE1BQU0sQ0FBQyxXQUFXLGlCQUFpQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTthQUN0SDtRQUNGLENBQUM7S0FBQTtJQUVNLGlCQUFpQixDQUFFLE9BQXdCO1FBQ2pELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0lBQ3ZCLENBQUM7Q0FDRDtBQW5DRCxnQ0FtQ0MifQ==