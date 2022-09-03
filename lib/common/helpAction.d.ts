import { IAction, Message, Store, ActionContext, Formatter, UsageBuilder, DiscordBotEventEmitter } from '..';
export declare class HelpAction implements IAction<{}> {
    readonly name = "help";
    readonly description = "Serves you this text. Can also be given another action's name to give usage information.";
    readonly usage: UsageBuilder;
    readonly admin = false;
    private readonly formatter;
    private readonly actions;
    constructor(formatter: Formatter, emitter: DiscordBotEventEmitter, current?: ActionContext[]);
    run(message: Message, _store: Store<{}>): Promise<void>;
    private parseHelpString;
}
//# sourceMappingURL=helpAction.d.ts.map