import { DiscordBot } from ".";

const substitutions: Record<string, (bot: DiscordBot) => string> = {
    ":prefix:": (bot: DiscordBot) => bot.config.prefix,
};

export function format(templateStr: string, bot: DiscordBot) {
    for (const [ pattern, write ] of Object.entries(substitutions)) {
        templateStr.replaceAll(pattern, write(bot));
    }
}
