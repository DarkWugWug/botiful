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
    constructor(emitter, current) {
        this.name = 'help';
        this.description = 'Displays a list of all commands available to you';
        this.admin = false;
        this.actions = [];
        if (current != null)
            this.actions.push(...current);
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
        const header = '**Actions:**\n\n';
        const actionsText = actionList
            .map((x) => `${`\`:prefix:${x.name}\``}: ${x.description}`)
            .join('\n\n');
        return header + actionsText;
    }
}
exports.HelpAction = HelpAction;
class ManCommand {
    constructor(emitter, current) {
        this.name = 'man';
        this.description = 'Displays in-depth help for an action';
        this.man = '!man <command>';
        this.admin = false;
        this.actions = [];
        if (current != null)
            this.actions.push(...current);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLE1BQWEsVUFBVTtJQVN0QixZQUFhLE9BQXFCLEVBQUUsT0FBeUI7UUFSN0MsU0FBSSxHQUFHLE1BQU0sQ0FBQTtRQUNiLGdCQUFXLEdBQzFCLGtEQUFrRCxDQUFBO1FBRW5DLFVBQUssR0FBRyxLQUFLLENBQUE7UUFFWixZQUFPLEdBQW9CLEVBQUUsQ0FBQTtRQUc3QyxJQUFJLE9BQU8sSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQTtRQUNsRCxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFFWSxHQUFHLENBQ2YsT0FBZ0IsRUFDaEIsTUFBaUIsRUFDakIsT0FBZTs7WUFFZixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtRQUN4RCxDQUFDO0tBQUE7SUFFTyxlQUFlLENBQUUsVUFBMkI7UUFDbkQsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUE7UUFDakMsTUFBTSxXQUFXLEdBQUcsVUFBVTthQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNkLE9BQU8sTUFBTSxHQUFHLFdBQVcsQ0FBQTtJQUM1QixDQUFDO0NBQ0Q7QUEvQkQsZ0NBK0JDO0FBRUQsTUFBYSxVQUFVO0lBVXRCLFlBQWEsT0FBcUIsRUFBRSxPQUF5QjtRQVQ3QyxTQUFJLEdBQUcsS0FBSyxDQUFBO1FBQ1osZ0JBQVcsR0FDMUIsc0NBQXNDLENBQUE7UUFFdkIsUUFBRyxHQUFHLGdCQUFnQixDQUFBO1FBQ3RCLFVBQUssR0FBRyxLQUFLLENBQUE7UUFFWixZQUFPLEdBQW9CLEVBQUUsQ0FBQTtRQUc3QyxJQUFJLE9BQU8sSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQTtRQUNsRCxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFFWSxHQUFHLENBQUUsT0FBZ0IsRUFBRSxNQUFpQixFQUFFLE1BQWM7O1lBQ3BFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDN0MsSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO2dCQUN0QixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQTtnQkFDeEUsT0FBTTthQUNOO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUE7WUFDN0QsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUNuQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxTQUFTLG9CQUFvQixDQUFDLENBQUE7Z0JBQy9ELE9BQU07YUFDTjtZQUNELElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLE1BQU0sQ0FBQyxJQUFJLDBCQUEwQixNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQTthQUM3RjtpQkFBTTtnQkFDTixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxNQUFNLENBQUMsSUFBSSwwQkFBMEIsTUFBTSxDQUFDLFdBQVcsaUJBQWlCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO2FBQ3RIO1FBQ0YsQ0FBQztLQUFBO0NBQ0Q7QUFsQ0QsZ0NBa0NDIn0=