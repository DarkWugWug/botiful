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
exports.RbacMiddleware = void 0;
class RbacMiddleware {
    constructor(emitter, actions, logger) {
        this.name = 'roleBasedAccessControl';
        this.roles = new Set();
        for (const action of actions) {
            this.addActionRoles(action);
        }
        emitter.on('register:action', (action) => this.addActionRoles(action));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmJhY01pZGRsZXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uL3JiYWNNaWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQU9BLE1BQWEsY0FBYztJQU0xQixZQUFhLE9BQStCLEVBQUUsT0FBd0IsRUFBRSxNQUFlO1FBTHZFLFNBQUksR0FBRyx3QkFBd0IsQ0FBQTtRQUU5QixVQUFLLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUE7UUFJOUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUMzQjtRQUNELE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxNQUFxQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7UUFDckYsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDckIsQ0FBQztJQUVZLElBQUksQ0FBRSxZQUE2QixFQUFFLE1BQWM7O1lBQy9ELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJO3dCQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxJQUFJLHVGQUF1RixDQUFDLENBQUE7b0JBQ3hLLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFBO2lCQUNyQzthQUNEO1FBQ0YsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUNqQixNQUFxQixFQUNyQixPQUFnQixFQUNoQixJQUFxQjs7WUFFckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQTthQUNYO1lBQ0QsSUFBSSxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbEQsT0FBTyxJQUFJLENBQUE7YUFDWDtpQkFBTTtnQkFDTixNQUFNLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQUE7Z0JBQzlDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDbkMsSUFBSSxLQUFLLElBQUksSUFBSTtvQkFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFBO2dCQUM1QixLQUFLLEVBQUUsQ0FBQTtnQkFDUCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO2dCQUM5QyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFO29CQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDZixvQ0FBb0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGFBQWEsTUFBTSxDQUFDLElBQUksV0FBVyxLQUFLLGdDQUFnQyxDQUM5SCxDQUFBO29CQUNELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNoQix3QkFBd0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUN4RyxDQUFBO2lCQUNEO2dCQUNELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO2dCQUMvRCxPQUFPLEtBQUssQ0FBQTthQUNaO1FBQ0YsQ0FBQztLQUFBO0lBRU8sY0FBYyxDQUFFLE1BQXFCO1FBQzVDLElBQUksTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJO1lBQUUsT0FBTTtRQUNoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDcEI7SUFDRixDQUFDO0NBQ0Q7QUExREQsd0NBMERDIn0=