import { IAction, Logger, Message, Store } from './';
import { ActionContext } from './foundation';
export declare class HelpAction implements IAction<{}> {
    readonly name = "help";
    readonly description = "Displays a list of all commands available to you";
    readonly admin = false;
    private helpString;
    constructor(actionList: ActionContext[]);
    run(message: Message, _store: Store<{}>, _logger: Logger): Promise<void>;
    replaceActionList(actionList: ActionContext[]): void;
    private parseHelpString;
}
export declare class ManCommand implements IAction<{}> {
    readonly name = "man";
    readonly description = "Displays the manual entry for a specified command";
    readonly man = "!man <command>";
    readonly admin = false;
    run(): Promise<void>;
}
//# sourceMappingURL=actions.d.ts.map