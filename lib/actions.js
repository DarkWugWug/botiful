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
    constructor(emitter) {
        this.name = 'help';
        this.description = 'Displays a list of all commands available to you';
        this.admin = false;
        this.actions = [];
        emitter.on('actionLoaded', (x) => {
            this.actions.push(x);
        });
    }
    run(message, _store, _logger) {
        return __awaiter(this, void 0, void 0, function* () {
            yield message.reply(this.parseHelpString(this.actions));
        });
    }
    parseHelpString(actionList) {
        const header = '**:botName: actions:**\n';
        const actionsText = actionList
            .map((x) => `${`\`:prefix:${x.name}\``}: ${x.description}`)
            .join('\n\n');
        return header + actionsText;
    }
}
exports.HelpAction = HelpAction;
class ManCommand {
    constructor(emitter) {
        this.name = 'man';
        this.description = 'Displays the manual entry for an action';
        this.man = '!man <command>';
        this.admin = false;
        this.actions = [];
        emitter.on('actionLoaded', (x) => {
            this.actions.push(x);
        });
    }
    run(message, _store, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionStr = message.asCommand().args[0];
            if (actionStr == null) {
                yield message.reply('What should I lookup? Example: `:prefix:man help`');
                return;
            }
            const action = this.actions.find((x) => x.name === actionStr);
            logger.debug(this.actions);
            if (action == null) {
                yield message.reply(`\`:prefix:${actionStr}\` isn't an action`);
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
}
exports.ManCommand = ManCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLE1BQWEsVUFBVTtJQVN0QixZQUFhLE9BQXFCO1FBUmxCLFNBQUksR0FBRyxNQUFNLENBQUE7UUFDYixnQkFBVyxHQUMxQixrREFBa0QsQ0FBQTtRQUVuQyxVQUFLLEdBQUcsS0FBSyxDQUFBO1FBRVosWUFBTyxHQUFvQixFQUFFLENBQUE7UUFHN0MsT0FBTyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUU7WUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckIsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDO0lBRVksR0FBRyxDQUNmLE9BQWdCLEVBQ2hCLE1BQWlCLEVBQ2pCLE9BQWU7O1lBRWYsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7UUFDeEQsQ0FBQztLQUFBO0lBRU8sZUFBZSxDQUFFLFVBQTJCO1FBQ25ELE1BQU0sTUFBTSxHQUFHLDBCQUEwQixDQUFBO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLFVBQVU7YUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDZCxPQUFPLE1BQU0sR0FBRyxXQUFXLENBQUE7SUFDNUIsQ0FBQztDQUNEO0FBOUJELGdDQThCQztBQUVELE1BQWEsVUFBVTtJQVV0QixZQUFhLE9BQXFCO1FBVGxCLFNBQUksR0FBRyxLQUFLLENBQUE7UUFDWixnQkFBVyxHQUMxQix5Q0FBeUMsQ0FBQTtRQUUxQixRQUFHLEdBQUcsZ0JBQWdCLENBQUE7UUFDdEIsVUFBSyxHQUFHLEtBQUssQ0FBQTtRQUVaLFlBQU8sR0FBb0IsRUFBRSxDQUFBO1FBRzdDLE9BQU8sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO1lBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVZLEdBQUcsQ0FBRSxPQUFnQixFQUFFLE1BQWlCLEVBQUUsTUFBYzs7WUFDcEUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUM3QyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7Z0JBQ3RCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO2dCQUN4RSxPQUFNO2FBQ047WUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQTtZQUM3RCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUMxQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQ25CLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLFNBQVMsb0JBQW9CLENBQUMsQ0FBQTtnQkFDL0QsT0FBTTthQUNOO1lBQ0QsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsTUFBTSxDQUFDLElBQUksMEJBQTBCLE1BQU0sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFBO2FBQzdGO2lCQUFNO2dCQUNOLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLE1BQU0sQ0FBQyxJQUFJLDBCQUEwQixNQUFNLENBQUMsV0FBVyxpQkFBaUIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7YUFDdEg7UUFDRixDQUFDO0tBQUE7Q0FDRDtBQWxDRCxnQ0FrQ0MifQ==