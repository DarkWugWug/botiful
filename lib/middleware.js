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
            if (yield message.authorHasRole(this.roleName)) {
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
            if (yield message.authorHasAnyRole(action.roles)) {
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
                yield message.reply('You are not allowed to use this command.');
                return false;
            }
        });
    }
}
exports.UsernameAccessMiddleware = UsernameAccessMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEscUJBQXFCO0lBSWpDLFlBQWEsUUFBZ0I7UUFIYixTQUFJLEdBQUcsd0JBQXdCLENBQUE7UUFJOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDekIsQ0FBQztJQUVZLEtBQUssQ0FDakIsTUFBcUIsRUFDckIsT0FBZ0IsRUFDaEIsSUFBNEIsRUFDNUIsTUFBYzs7WUFFZCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFDOUIsSUFBSSxNQUFNLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvQyxPQUFPLElBQUksQ0FBQTthQUNYO2lCQUFNO2dCQUNOLE1BQU0sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsQ0FBQTtnQkFDOUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNuQyxJQUFJLEtBQUssSUFBSSxJQUFJO29CQUFFLEtBQUssR0FBRyxDQUFDLENBQUE7Z0JBQzVCLEtBQUssRUFBRSxDQUFBO2dCQUNQLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7Z0JBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQ1YsZ0NBQWdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxjQUFjLE1BQU0sQ0FBQyxJQUFJLFdBQVcsS0FBSyxnQ0FBZ0MsQ0FDM0gsQ0FBQTtnQkFDRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQTtnQkFDL0QsT0FBTyxLQUFLLENBQUE7YUFDWjtR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