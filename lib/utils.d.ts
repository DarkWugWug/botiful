import { Client, TextBasedChannel } from 'discord.js';
export declare class Formatter {
    private readonly prefix;
    private readonly adminRole;
    private readonly client;
    static substitutions: Record<string, (self: Formatter) => string>;
    constructor(prefix: string, adminRole: string, client: Client);
    fmt(x: string): string;
}
export declare function doTyping(channel: TextBasedChannel, typing?: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map