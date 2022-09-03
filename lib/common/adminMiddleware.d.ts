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
export {};
//# sourceMappingURL=adminMiddleware.d.ts.map