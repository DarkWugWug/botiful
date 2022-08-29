import { IMiddleware } from "./foundation";



export const adminMiddleware: IMiddleware =
{
    name: 'auth',
    apply: (action, message, bot) => {
        if(!action.admin) { return true; }
        return !!message.member && message.member.roles.cache.some((role) => role.name === bot.adminRole);
    }
};
export const rolesMiddleware: IMiddleware =
{
    name: 'roles',
    apply: (action, message) => {
        if(!action.roles || action.roles.length === 0) { return true; }
        return !!message.member && message.member.roles.cache.some((member_role) =>
            (action.roles as string[]).some((action_role) =>
                action_role === member_role.name));
    }
};
export const usersMiddleware: IMiddleware =
{
    name: 'users',
    apply: (action, message) => {
        if(!action.users || action.users.length === 0) { return true; }
        return (action.users as string[]).some((username) => message.author.username === username);
    }
};
