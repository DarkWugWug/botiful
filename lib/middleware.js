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
