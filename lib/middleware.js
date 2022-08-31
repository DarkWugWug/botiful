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
exports.UsernameAccessMiddleware = exports.RbacMiddleware = exports.AdminAccessMiddleware = void 0;
class AdminAccessMiddleware {
    constructor(roleName) {
        this.name = 'adminRoleAccessControl';
        this.roleName = roleName;
    }
    apply(action, message, data, logger) {
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
                logger.warn(`Admin action denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`);
                logger.debug(`Needed a role of ${this.roleName}, but got [ ${message.author.getRoles().join(', ')} ]`);
                yield message.reply('You are not allowed to use this command.');
                return false;
            }
        });
    }
}
exports.AdminAccessMiddleware = AdminAccessMiddleware;
class RbacMiddleware {
    constructor() {
        this.name = 'roleBasedAccessControl';
    }
    apply(action, message, data, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((action.roles == null) || action.roles.length === 0) {
                return true;
            }
            if (yield message.author.hasAnyRole(action.roles)) {
                return true;
            }
            else {
                const key = `${message.author.id}:deniedCount`;
                let count = yield data.getItem(key);
                if (count == null)
                    count = 0;
                count++;
                yield data.setItem(key, count, 15 * 60 * 1000);
                logger.warn(`Role base access denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`);
                logger.debug(`Needed any role in [ ${action.roles.join(', ')} ], but got [ ${message.author.getRoles().join(', ')} ]`);
                yield message.reply('You are not allowed to use this command.');
                return false;
            }
        });
    }
}
exports.RbacMiddleware = RbacMiddleware;
class UsernameAccessMiddleware {
    constructor() {
        this.name = 'usernameBasedAccessControl';
    }
    apply(action, message, data, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((action.users == null) || action.users.length === 0)
                return true;
            const isExpectedUser = (action.users).some((username) => message.author.username === username);
            if (isExpectedUser) {
                return true;
            }
            else {
                const key = `${message.author.id}:deniedCount`;
                let count = yield data.getItem(key);
                if (count == null)
                    count = 0;
                count++;
                yield data.setItem(key, count, 15 * 60 * 1000);
                logger.warn(`Username based access denied for user ${message.author.tag} involving ${action.name}. Tried ${count} times in the past 15 minutes.`);
                logger.debug(`Permitted users [ ${action.users.join(', ')} ]`);
                yield message.reply('You are not allowed to use this command.');
                return false;
            }
        });
    }
}
exports.UsernameAccessMiddleware = UsernameAccessMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEscUJBQXFCO0lBSWpDLFlBQWEsUUFBZ0I7UUFIYixTQUFJLEdBQUcsd0JBQXdCLENBQUE7UUFJOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDekIsQ0FBQztJQUVZLEtBQUssQ0FDakIsTUFBcUIsRUFDckIsT0FBZ0IsRUFDaEIsSUFBNEIsRUFDNUIsTUFBYzs7WUFFZCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFDOUIsSUFBSSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxJQUFJLENBQUE7YUFDWDtpQkFBTTtnQkFDTixNQUFNLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUE7Z0JBQzlDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDbkMsSUFBSSxLQUFLLElBQUksSUFBSTtvQkFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFBO2dCQUM1QixLQUFLLEVBQUUsQ0FBQTtnQkFDUCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO2dCQUM5QyxNQUFNLENBQUMsSUFBSSxDQUNWLGdDQUFnQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsY0FBYyxNQUFNLENBQUMsSUFBSSxXQUFXLEtBQUssZ0NBQWdDLENBQzNILENBQUE7Z0JBQ0QsTUFBTSxDQUFDLEtBQUssQ0FDWCxvQkFBb0IsSUFBSSxDQUFDLFFBQVEsZUFBZSxPQUFPLENBQUMsTUFB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