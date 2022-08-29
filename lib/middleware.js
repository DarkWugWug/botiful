"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersMiddleware = exports.rolesMiddleware = exports.adminMiddleware = void 0;
exports.adminMiddleware = {
    apply: (action, message, bot) => {
        if (!action.admin) {
            return true;
        }
        return !!message.member && message.member.roles.cache.some((role) => role.name === bot.adminRole);
    }
};
exports.rolesMiddleware = {
    apply: (action, message) => {
        if (!action.roles || action.roles.length === 0) {
            return true;
        }
        return !!message.member && message.member.roles.cache.some((member_role) => action.roles.some((action_role) => action_role === member_role.name));
    }
};
exports.usersMiddleware = {
    apply: (action, message) => {
        if (!action.users || action.users.length === 0) {
            return true;
        }
        return action.users.some((username) => message.author.username === username);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlhLFFBQUEsZUFBZSxHQUM1QjtJQUNJLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDNUIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFBRSxPQUFPLElBQUksQ0FBQztTQUFFO1FBQ2xDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEcsQ0FBQztDQUNKLENBQUM7QUFDVyxRQUFBLGVBQWUsR0FDNUI7SUFDSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUMvRCxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUN0RSxNQUFNLENBQUMsS0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUM1QyxXQUFXLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0MsQ0FBQztDQUNKLENBQUM7QUFDVyxRQUFBLGVBQWUsR0FDNUI7SUFDSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUMvRCxPQUFRLE1BQU0sQ0FBQyxLQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKLENBQUMifQ==