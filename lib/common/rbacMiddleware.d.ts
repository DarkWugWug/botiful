import { ActionContext, IMiddleware, Logger, Message, Store, Client, DiscordBotEventEmitter } from '..';
interface RbacData {
    [id: string]: number;
}
export declare class RbacMiddleware implements IMiddleware<RbacData> {
    readonly name = "roleBasedAccessControl";
    private readonly roles;
    private readonly logger?;
    constructor(emitter: DiscordBotEventEmitter, actions: ActionContext[], logger?: Logger);
    init(_privateData: Store<RbacData>, client: Client): Promise<void>;
    apply(action: ActionContext, message: Message, data: Store<RbacData>): Promise<boolean>;
    private addActionRoles;
}
export {};
//# sourceMappingURL=rbacMiddleware.d.ts.map