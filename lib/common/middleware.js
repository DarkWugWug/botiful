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
class RbacMiddleware {
    constructor(emitter, actions, logger) {
        this.name = 'roleBasedAccessControl';
        this.roles = new Set();
        for (const action of actions) {
            this.addActionRoles(action);
        }
        emitter.on('actionLoaded', (action) => this.addActionRoles(action));
        this.logger = logger;
    }
    init(_privateData, client) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const role of this.roles) {
                if (!client.guildsHaveRole(role)) {
                    if (this.logger != null)
                        this.logger.warn(`Not all guilds have role named ${role}  (it's being used by some loaded action). Creating new role for the rbac middleware.`);
                    yield client.createRoleInGuilds(role);
                }
            }
        });
    }
    apply(action, message, data) {
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
                if (this.logger != null) {
                    this.logger.warn(`Role base access denied for user ${message.author.tag} invoking ${action.name}. Tried ${count} times in the past 15 minutes.`);
                    this.logger.debug(`Needed any role in [ ${action.roles.join(', ')} ], but got [ ${message.author.getRoles().join(', ')} ]`);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vbWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFRQSxNQUFhLHFCQUFxQjtJQUtqQyxZQUFhLFFBQWdCLEVBQUUsTUFBZTtRQUo5QixTQUFJLEdBQUcsd0JBQXdCLENBQUE7UUFLOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDckIsQ0FBQztJQUVZLElBQUksQ0FBRSxZQUFvQyxFQUFFLE1BQWM7O1lBQ3RFLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUFFLE9BQU07WUFDaEQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUk7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLElBQUksQ0FBQyxRQUFRLCtDQUErQyxDQUFDLENBQUE7WUFDekksTUFBTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUN6RCxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQ2pCLE1BQXFCLEVBQ3JCLE9BQWdCLEVBQ2hCLElBQTRCOztZQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUE7WUFDOUIsSUFBSSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxJQUFJLENBQUE7YUFDWDtpQkFBTTtnQkFDTixNQUFNLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUE7Z0JBQzlDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FB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