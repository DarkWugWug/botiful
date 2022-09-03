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
            if (client.guildsHaveRole(this.roleName))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5NaWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9hZG1pbk1pZGRsZXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBT0EsTUFBYSxxQkFBcUI7SUFLakMsWUFBYSxRQUFnQixFQUFFLE1BQWU7UUFKOUIsU0FBSSxHQUFHLHdCQUF3QixDQUFBO1FBSzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0lBQ3JCLENBQUM7SUFFWSxJQUFJLENBQUUsWUFBb0MsRUFBRSxNQUFjOztZQUN0RSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFBRSxPQUFNO1lBQ2hELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJO2dCQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxJQUFJLENBQUMsUUFBUSwrQ0FBK0MsQ0FBQyxDQUFBO1lBQ3pJLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDekQsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUNqQixNQUFxQixFQUNyQixPQUFnQixFQUNoQixJQUE0Qjs7WUFFNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBQzlCLElBQUksTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sSUFBSSxDQUFBO2FBQ1g7aUJBQU07Z0JBQ04sTUFBTSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxDQUFBO2dCQUM5QyxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ25DLElBQUksS0FBSyxJQUFJLElBQUk7b0JBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFDNUIsS0FBSyxFQUFFLENBQUE7Z0JBQ1AsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtnQkFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksRUFBRTtvQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2YsZ0NBQWdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxhQUFhLE1BQU0sQ0FBQyxJQUFJLFdBQVcsS0FBSyxnQ0FBZ0MsQ0FDMUgsQ0FBQTtvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDaEIsb0JBQW9CLElBQUksQ0FBQyxRQUFRLGVBQWUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FDeEYsQ0FBQTtpQkFDRDtnQkFDRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQTtnQkFDL0QsT0FBTyxLQUFLLENBQUE7YUFDWjtRQUNGLENBQUM7S0FBQTtDQUNEO0FBMUNELHNEQTBDQyJ9