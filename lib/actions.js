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
    constructor() {
        this.name = 'man';
        this.description = 'Displays the manual entry for a specified command';
        this.man = '!man <command>';
        this.admin = false;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.ManCommand = ManCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEsVUFBVTtJQVN0QixZQUFhLFVBQTJCO1FBUnhCLFNBQUksR0FBRyxNQUFNLENBQUE7UUFDYixnQkFBVyxHQUMxQixrREFBa0QsQ0FBQTtRQUVuQyxVQUFLLEdBQUcsS0FBSyxDQUFBO1FBSzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBRVksR0FBRyxDQUNmLE9BQWdCLEVBQ2hCLE1BQWlCLEVBQ2pCLE9BQWU7O1lBRWYsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNyQyxDQUFDO0tBQUE7SUFFTSxpQkFBaUIsQ0FBRSxVQUEyQjtRQUNwRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVPLGVBQWUsQ0FBRSxVQUEyQjtRQUNuRCxPQUFPLFVBQVU7YUFDZixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNmLENBQUM7Q0FDRDtBQTlCRCxnQ0E4QkM7QUFFRCxNQUFhLFVBQVU7SUFBdkI7UUFDaUIsU0FBSSxHQUFHLEtBQUssQ0FBQTtRQUNaLGdCQUFXLEdBQzFCLG1EQUFtRCxDQUFBO1FBRXBDLFFBQUcsR0FBRyxnQkFBZ0IsQ0FBQTtRQUN0QixVQUFLLEdBQUcsS0FBSyxDQUFBO0lBa0I5QixDQUFDO0lBaEJhLEdBQUc7O1FBZWhCLENBQUM7S0FBQTtDQUNEO0FBeEJELGdDQXdCQyJ9