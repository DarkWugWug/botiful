import EventEmitter from 'events';
import { IAction, Logger, Message, Store } from './';
import { ActionContext } from './foundation';
export declare class HelpAction implements IAction<{}> {
    readonly name = "help";
    readonly description = "Displays a list of all commands available to you";
    readonly admin = false;
    private readonly actions;
    constructor(emitter: EventEmitter, current?: ActionContext[]);
    run(message: Message, _store: Store<{}>, _logger: Logger): Promise<void>;
    private parseHelpString;
}
export declare class ManCommand implements IAction<{}> {
    readonly name = "man";
    readonly description = "Displays in-depth help for an action";
    readonly man = "!man <command>";
    readonly admin = false;
    private readonly actions;
    constructor(emitter: EventEmitter, current?: ActionContext[]);
    run(message: Message, _store: Store<{}>, logger: Logger): Promise<void>;
}
//# sourceMappingURL=actions.d.ts.map