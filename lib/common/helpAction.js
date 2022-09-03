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
const __1 = require("..");
class HelpAction {
    constructor(formatter, emitter, current) {
        this.name = 'help';
        this.description = 'Serves you this text. Can also be given another action\'s name to give usage information.';
        this.usage = new __1.UsageBuilder(this.name)
            .whenGiven()
            .will('Respond with a list of every action with its description')
            .whenGiven('exampleAction')
            .will('Respond with just the description and usage examples for `exampleAction`');
        this.admin = false;
        this.actions = [];
        if (current != null)
            this.actions.push(...current);
        this.formatter = formatter;
        emitter.on('register:action', (x) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscEFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vaGVscEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFJQSwwQkFBNEc7QUFFNUcsTUFBYSxVQUFVO0lBZ0J0QixZQUFhLFNBQW9CLEVBQUUsT0FBK0IsRUFBRSxPQUF5QjtRQWY3RSxTQUFJLEdBQUcsTUFBTSxDQUFBO1FBRWIsZ0JBQVcsR0FDMUIsMkZBQTJGLENBQUE7UUFFNUUsVUFBSyxHQUFHLElBQUksZ0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pELFNBQVMsRUFBRTthQUNYLElBQUksQ0FBQywwREFBMEQsQ0FBQzthQUNoRSxTQUFTLENBQUMsZUFBZSxDQUFDO2FBQzFCLElBQUksQ0FBQywwRUFBMEUsQ0FBQyxDQUFBO1FBRWxFLFVBQUssR0FBRyxLQUFLLENBQUE7UUFFWixZQUFPLEdBQW9CLEVBQUUsQ0FBQTtRQUc3QyxJQUFJLE9BQU8sSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixPQUFPLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3JCLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVZLEdBQUcsQ0FDZixPQUFnQixFQUNoQixNQUFpQjs7WUFFakIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUM3QyxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7Z0JBQ3RCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO2dCQUN2RCxPQUFNO2FBQ047WUFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQTtZQUNwRSxJQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7Z0JBQzFCLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLFNBQVMsb0JBQW9CLENBQUMsQ0FBQTtnQkFDL0QsT0FBTTthQUNOO1lBQ0QsSUFBSSxhQUFhLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDaEMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsYUFBYSxDQUFDLElBQUksMEJBQTBCLGFBQWEsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFBO2FBQzNHO2lCQUFNO2dCQUNOLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FDbEIsRUFBRSxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUN6RCxDQUFBO2FBQ0Q7UUFDRixDQUFDO0tBQUE7SUFFTyxlQUFlLENBQUUsVUFBMkI7UUFDbkQsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUE7UUFDakMsTUFBTSxXQUFXLEdBQUcsVUFBVTthQUM1QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNkLE9BQU8sTUFBTSxHQUFHLFdBQVcsQ0FBQTtJQUM1QixDQUFDO0NBQ0Q7QUF0REQsZ0NBc0RDIn0=