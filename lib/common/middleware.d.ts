import EventEmitter from 'events';
import { ActionContext, IMiddleware, Logger, Message, Store, Client } from '..';
interface AdminAccessData {
    [id: string]: number;
}
export declare class AdminAccessMiddleware implements IMiddleware<AdminAccessData> {
    readonly name = "adminRoleAccessControl";
    private readonly roleName;
    private readonly logger?;
    constructor(roleName: string, logger?: Logger);
    init(_privateData: Store<AdminAccessData>, client: Client): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<AdminAccessData>): Promise<boolean>;
}
interface RbacData {
    [id: string]: number;
}
export declare class RbacMiddleware implements IMiddleware<RbacData> {
    readonly name = "roleBasedAccessControl";
    private readonly roles;
    private readonly logger?;
    constructor(emitter: EventEmitter, actions: ActionContext[], logger?: Logger);
    init(_privateData: Store<AdminAccessData>, client: Client): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<RbacData>): Promise<boolean>;
    private addActionRoles;
}
export {};
//# sourceMappingURL=middleware.d.ts.map