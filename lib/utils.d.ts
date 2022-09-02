import { Client, EmbedBuilder, TextBasedChannel } from 'discord.js';
export declare class Formatter {
    private readonly prefix;
    private readonly adminRole;
    private readonly client;
    static substitutions: Record<string, (self: Formatter) => string>;
    constructor(prefix: string, adminRole: string, client: Client);
    fmt(x: string): string;
}
export declare function doTyping(channel: TextBasedChannel, typing?: number): Promise<void>;
export declare class UsageBuilder {
    private readonly name;
    private description?;
    private readonly useCases;
    constructor(name: string);
    broadlySpeaking(desc: string): this;
    whenGiven(...inputs: string[]): this;
    will(infoText: string): this;
    _format(f: Formatter): EmbedBuilder;
}
//# sourceMappingURL=utils.d.ts.map