import { ActionContext, IMiddleware, Logger, Message, Store } from './';
interface AdminAccessData {
    [id: string]: number;
}
export declare class AdminAccessMiddleware implements IMiddleware<AdminAccessData> {
    readonly name = "adminRoleAccessControl";
    private readonly roleName;
    constructor(roleName: string);
    init(privateData: Store<AdminAccessData>, logger: Logger): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<AdminAccessData>, logger: Logger): Promise<boolean>;
}
interface RbacData {
    [id: string]: number;
}
export declare class RbacMiddleware implements IMiddleware<RbacData> {
    readonly name = "roleBasedAccessControl";
    apply(action: ActionContext, message: Message, data: Store<RbacData>, logger: Logger): Promise<boolean>;
}
export interface UsernameAccessData {
    [id: string]: number;
}
export declare class UsernameAccessMiddleware implements IMiddleware<UsernameAccessData> {
    readonly name = "usernameBasedAccessControl";
    apply(action: ActionContext, message: Message, data: Store<UsernameAccessData>, logger: Logger): Promise<boolean>;
}
export {};
//# sourceMappingURL=middleware.d.ts.map