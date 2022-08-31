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
    init(_privateData, logger, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (client.guildsHaveRole(this.roleName))
                return;
            logger.warn(`Not all guilds have role named ${this.roleName}. Creating new role for the admin middleware.`);
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
                logger.warn(`Admin action denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`);
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
    init(_privateData, logger, client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const role of this.roles) {
                if (!client.guildsHaveRole(role)) {
                    logger.warn(`Not all guilds have role named ${role}. Creating new role for the rbac middleware (it's being used by some loaded action).`);
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
                logger.warn(`Role base access denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUlBLE1BQWEscUJBQXFCO0lBSWpDLFlBQWEsUUFBZ0I7UUFIYixTQUFJLEdBQUcsd0JBQXdCLENBQUE7UUFJOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDekIsQ0FBQztJQUVZLElBQUksQ0FBRSxZQUFvQyxFQUFFLE1BQWMsRUFBRSxNQUFjOztZQUN0RixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFBRSxPQUFNO1lBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLElBQUksQ0FBQyxRQUFRLCtDQUErQyxDQUFDLENBQUE7WUFDM0csTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN6RCxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQ2pCLE1BQXFCLEVBQ3JCLE9BQWdCLEVBQ2hCLElBQTRCLEVBQzVCLE1BQWM7O1lBRWQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2dCQUFFLE9BQU8sSUFBSSxDQUFBO1lBQzlCLElBQUksTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sSUFBSSxDQUFBO2FBQ1g7aUJBQU07Z0JBQ04sTUFBTSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsY0FBYyxDQUFBO2dCQUM5QyxJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ25DLElBQUksS0FBSyxJQUFJLElBQUk7b0JBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQTtnQkFDNUIsS0FBSyxFQUFFLENBQUE7Z0JBQ1As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