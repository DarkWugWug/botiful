/// <reference types="node" />
import EventEmitter from 'events';
import { ActionContext, IMiddleware, Logger, Message, Store, Client } from './';
interface AdminAccessData {
    [id: string]: number;
}
export declare class AdminAccessMiddleware implements IMiddleware<AdminAccessData> {
    readonly name = "adminRoleAccessControl";
    private readonly roleName;
    constructor(roleName: string);
    init(_privateData: Store<AdminAccessData>, _logger: Logger, client: Client): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<AdminAccessData>, logger: Logger): Promise<boolean>;
}
interface RbacData {
    [id: string]: number;
}
export declare class RbacMiddleware implements IMiddleware<RbacData> {
    readonly name = "roleBasedAccessControl";
    private readonly roles;
    constructor(emitter: EventEmitter, actions: ActionContext[]);
    init(_privateData: Store<AdminAccessData>, _logger: Logger, client: Client): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<RbacData>, logger: Logger): Promise<boolean>;
    private addActionRoles;
}
export {};
//# sourceMappingURL=middleware.d.ts.map