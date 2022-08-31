import { TextBasedChannel } from 'discord.js';
export declare class Formatter {
    private readonly prefix;
    private readonly adminRole;
    static substitutions: Record<string, (self: Formatter) => string>;
    constructor(prefix: string, adminRole: string);
    fmt(x: string): string;
}
export declare function doTyping(channel: TextBasedChannel, typing?: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map