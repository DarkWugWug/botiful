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
exports.RbacMiddleware = exports.AdminAccessMiddleware = void 0;
class AdminAccessMiddleware {
    constructor(roleName) {
        this.name = 'adminRoleAccessControl';
        this.roleName = roleName;
    }
    init(_privateData, _logger, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (client.guildsHaveRole(this.roleName))
                return;
            yield client.createRoleInGuilds(this.roleName, 'RANDOM');
        });
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
    constructor(emitter, actions) {
        this.name = 'roleBasedAccessControl';
        this.roles = new Set();
        for (const action of actions) {
            this.addActionRoles(action);
        }
        emitter.on('actionLoaded', (action) => this.addActionRoles(action));
    }
    init(_privateData, _logger, client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const role of this.roles) {
                if (!client.guildsHaveRole(role)) {
                    yield client.createRoleInGuilds(role);
                }
            }
        });
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
    addActionRoles(action) {
        if (action.roles == null)
            return;
        for (const role of action.roles) {
            this.roles.add(role);
        }
    }
}
exports.RbacMiddleware = RbacMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLE1BQWEscUJBQXFCO0lBSWpDLFlBQWEsUUFBZ0I7UUFIYixTQUFJLEdBQUcsd0JBQXdCLENBQUE7UUFJOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDekIsQ0FBQztJQUVZLElBQUksQ0FBRSxZQUFvQyxFQUFFLE9BQWUsRUFBRSxNQUFjOztZQUN2RixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFBRSxPQUFNO1lBQ2hELE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDekQsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUNqQixNQUFxQixFQUNyQixPQUFnQixFQUNoQixJQUE0QixFQUM1QixNQUFjOztZQUVkLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztnQkFBRSxPQUFPLElBQUksQ0FBQTtZQUM5QixJQUFJLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNoRCxPQUFPLElBQUksQ0FBQTthQUNYO2lCQUFNO2dCQUNOLE1BQU0sR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGNBQWMsQ0FBQTtnQkFDOUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNuQyxJQUFJLEtBQUssSUFBSSxJQUFJO29CQUFFLEtBQUssR0FBRyxDQUFDLENBQUE7Z0JBQzVCLEtBQUssRUFBRSxDQUFBO2dCQUNQLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcs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