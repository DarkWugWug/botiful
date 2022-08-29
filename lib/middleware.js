"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersMiddleware = exports.rolesMiddleware = exports.adminMiddleware = void 0;
exports.adminMiddleware = {
    name: 'auth',
    apply: (action, message, bot) => {
        if (!action.admin) {
            return true;
        }
        return !!message.member && message.member.roles.cache.some((role) => role.name === bot.adminRole);
    }
};
exports.rolesMiddleware = {
    name: 'roles',
    apply: (action, message) => {
        if (!action.roles || action.roles.length === 0) {
            return true;
        }
        return !!message.member && message.member.roles.cache.some((member_role) => action.roles.some((action_role) => action_role === member_role.name));
    }
};
exports.usersMiddleware = {
    name: 'users',
    apply: (action, message) => {
        if (!action.users || action.users.length === 0) {
            return true;
        }
        return action.users.some((username) => message.author.username === username);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlhLFFBQUEsZUFBZSxHQUM1QjtJQUNJLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUM1QixJQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDbEMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RyxDQUFDO0NBQ0osQ0FBQztBQUNXLFFBQUEsZUFBZSxHQUM1QjtJQUNJLElBQUksRUFBRSxPQUFPO0lBQ2IsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3ZCLElBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDL0QsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FDdEUsTUFBTSxDQUFDLEtBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FDNUMsV0FBVyxLQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSixDQUFDO0FBQ1csUUFBQSxlQUFlLEdBQzVCO0lBQ0ksSUFBSSxFQUFFLE9BQU87SUFDYixLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDdkIsSUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUMvRCxPQUFRLE1BQU0sQ0FBQyxLQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUM7SUFDL0YsQ0FBQztDQUNKLENBQUMifQ==