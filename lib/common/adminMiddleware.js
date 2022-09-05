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
exports.AdminAccessMiddleware = void 0;
class AdminAccessMiddleware {
    constructor(roleName, logger) {
        this.name = 'adminRoleAccessControl';
        this.roleName = roleName;
        this.logger = logger;
    }
    init(_privateData, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield client.guildsHaveRole(this.roleName))
                return;
            if (this.logger != null)
                this.logger.warn(`Not all guilds have role named ${this.roleName}. Creating new role for the admin middleware.`);
            yield client.createRoleInGuilds(this.roleName, 'Random');
        });
    }
    apply(action, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!action.admin)
                return true;
            if (yield message.author.hasRole(this.roleName)) {
                return true;
            }
            else {
                const key = `${message.author.id}:deniedCount`;
                let count = yield data.getItem(key);
                if (count == null)
                    count = 0;
                count++;
                yield data.setItem(key, count, 15 * 60 * 1000);
                if (this.logger != null) {
                    this.logger.warn(`Admin action denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`);
                    this.logger.debug(`Needed a role of ${this.roleName}, but got [ ${message.author.getRoles().join(', ')} ]`);
                }
                yield message.reply('You are not allowed to use this command.');
                return false;
            }
        });
    }
}
exports.AdminAccessMiddleware = AdminAccessMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5NaWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9hZG1pbk1pZGRsZXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsTUFBYSxxQkFBcUI7SUFLakMsWUFBYSxRQUFnQixFQUFFLE1BQWU7UUFKOUIsU0FBSSxHQUFHLHdCQUF3QixDQUFBO1FBSzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ3JCLENBQUM7SUFFWSxJQUFJLENBQUUsWUFBb0MsRUFBRSxNQUFjOztZQUN0RSxJQUFJLE1BQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUFFLE9BQU07WUFDdEQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUk7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLElBQUksQ0FBQyxRQUFRLCtDQUErQyxDQUFDLENBQUE7WUFDekksTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN6RCxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQ2pCLE1BQXFCLEVBQ3JCLE9BQWdCLEVBQ2hCLElBQTRCOztZQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFDOUIsSUFBSSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxJQUFJLENBQUE7YUFDWDtpQkFBTTtnQkFDTixNQUFNLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUE7Z0JBQzlDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDbkMsSUFBSSxLQUFLLElBQUksSUFBSTtvQkFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFBO2dCQUM1QixLQUFLLEVBQUUsQ0FBQTtnQkFDUCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO2dCQUM5QyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFO29CQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZixnQ0FBZ0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGFBQWEsTUFBTSxDQUFDLElBQUksV0FBVyxLQUFLLGdDQUFnQyxDQUMxSCxDQUFBO29CQUNELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNoQixvQkFBb0IsSUFBSSxDQUFDLFFBQVEsZUFBZSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUN4RixDQUFBO2lCQUNEO2dCQUNELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO2dCQUMvRCxPQUFPLEtBQUssQ0FBQTthQUNaO1FBQ0YsQ0FBQztLQUFBO0NBQ0Q7QUExQ0Qsc0RBMENDIn0=