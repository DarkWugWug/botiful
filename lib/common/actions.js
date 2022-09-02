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
exports.HelpAction = void 0;
const utils_1 = require("../utils");
class HelpAction {
    constructor(formatter, emitter, current) {
        this.name = 'help';
        this.description = 'Serves you this text. Can also be given another action\'s name to give usage information.';
        this.usage = new utils_1.UsageBuilder(this.name)
            .whenGiven()
            .will('Responds with a list of every action with its description')
            .whenGiven('exampleAction')
            .will('Respond with just the description and usage examples for `exampleAction`');
        this.admin = false;
        this.actions = [];
        if (current != null)
            this.actions.push(...current);
        this.formatter = formatter;
        emitter.on('actionLoaded', (x) => {
            this.actions.push(x);
        });
    }
    run(message, _store) {
        return __awaiter(this, void 0, void 0, function* () {
            const actionStr = message.asCommand().args[0];
            if (actionStr == null) {
                yield message.reply(this.parseHelpString(this.actions));
                return;
            }
            const queriedAction = this.actions.find((x) => x.name === actionStr);
            if (queriedAction == null) {
                yield message.reply(`\`:prefix:${actionStr}\` isn't an action`);
                return;
            }
            if (queriedAction.usage == null) {
                yield message.reply(`\`:prefix:${queriedAction.name}\`:\n**Description:**\t${queriedAction.description}\n`);
            }
            else {
                yield message.reply({ embeds: [queriedAction.usage._format(this.formatter)] });
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFNQSxvQ0FBa0Q7QUFFbEQsTUFBYSxVQUFVO0lBZ0J0QixZQUFhLFNBQW9CLEVBQUUsT0FBcUIsRUFBRSxPQUF5QjtRQWZuRSxTQUFJLEdBQUcsTUFBTSxDQUFBO1FBRWIsZ0JBQVcsR0FDMUIsMkZBQTJGLENBQUE7UUFFNUUsVUFBSyxHQUFHLElBQUksb0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pELFNBQVMsRUFBRTthQUNYLElBQUksQ0FBQywyREFBMkQsQ0FBQzthQUNqRSxTQUFTLENBQUMsZUFBZSxDQUFDO2FBQzFCLElBQUksQ0FBQywwRUFBMEUsQ0FBQyxDQUFBO1FBRWxFLFVBQUssR0FBRyxLQUFLLENBQUE7UUFFWixZQUFPLEdBQW9CLEVBQUUsQ0FBQTtRQUc3QyxJQUFJLE9BQU8sSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFFWSxHQUFHLENBQ2YsT0FBZ0IsRUFDaEIsTUFBaUI7O1lBRWpCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDN0MsSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO2dCQUN0QixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtnQkFDdkQsT0FBTTthQUNOO1lBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUE7WUFDcEUsSUFBSSxhQUFhLElBQUksSUFBSSxFQUFFO2dCQUMxQixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxTQUFTLG9CQUFvQixDQUFDLENBQUE7Z0JBQy9ELE9BQU07YUFDTjtZQUNELElBQUksYUFBYSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7Z0JBQ2hDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLGFBQWEsQ0FBQyxJQUFJLDBCQUEwQixhQUFhLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQTthQUMzRztpQkFBTTtnQkFDTixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQ2xCLEVBQUUsTUFBTSxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDekQsQ0FBQTthQUNEO1FBQ0YsQ0FBQztLQUFBO0lBRU8sZUFBZSxDQUFFLFVBQTJCO1FBQ25ELE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFBO1FBQ2pDLE1BQU0sV0FBVyxHQUFHLFVBQVU7YUFDNUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDZCxPQUFPLE1BQU0sR0FBRyxXQUFXLENBQUE7SUFDNUIsQ0FBQztDQUNEO0FBdERELGdDQXNEQyJ9