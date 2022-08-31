import { TextBasedChannel } from "discord.js";

export class Formatter {
    static substitutions: Record<string, (self: Formatter) => string> = {
        ":prefix:": (self) => self.prefix,
        ":adminRole": (self) => self.adminRole,
    } as const;

    constructor(private prefix: string, private adminRole: string) {}

    public fmt(x: string) {
        let formatStr = `${x}`; // Read as "cloning" templateStr to formatStr
        for (const [pattern, write] of Object.entries(
            Formatter.substitutions
        )) {
            formatStr = formatStr.replaceAll(pattern, write(this));
        }
        return formatStr;
    }
}

export function doTyping(
    channel: TextBasedChannel,
    typing: number = 0
) {
    channel.sendTyping();
    setTimeout(() => {}, typing);
}
