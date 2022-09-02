"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageBuilder = exports.doTyping = exports.Formatter = void 0;
const discord_js_1 = require("discord.js");
class Formatter {
    constructor(prefix, adminRole, client) {
        this.prefix = prefix;
        this.adminRole = adminRole;
        this.client = client;
    }
    fmt(x) {
        let formatStr = `${x}`;
        for (const [pattern, write] of Object.entries(Formatter.substitutions)) {
            formatStr = formatStr.replaceAll(pattern, write(this));
        }
        return formatStr;
    }
}
exports.Formatter = Formatter;
Formatter.substitutions = {
    ':prefix:': (self) => self.prefix,
    ':adminRole:': (self) => self.adminRole,
    ':botName:': (self) => {
        if (self.client.user != null) {
            return self.client.user.username;
        }
        else {
            return 'this bot';
        }
    }
};
function doTyping(channel, typing = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        yield channel.sendTyping();
        setTimeout(() => { }, typing);
    });
}
exports.doTyping = doTyping;
class UsageBuilder {
    constructor(name) {
        this.description = undefined;
        this.useCases = [];
        this.name = name;
    }
    broadlySpeaking(desc) {
        this.description = desc;
        return this;
    }
    whenGiven(...inputs) {
        this.useCases.push({ inputs });
        return this;
    }
    will(infoText) {
        this.useCases[this.useCases.length - 1].description = infoText;
        return this;
    }
    _format(f) {
        const builder = new discord_js_1.EmbedBuilder()
            .setColor('Greyple')
            .setTitle(`The ${this.name} action`);
        if (this.description != null)
            builder.setDescription(this.description);
        builder.addFields(this.useCases.map((x) => {
            if (x.description == null)
                x.description = '';
            const inputStr = x.inputs
                .map((x) => `\`${x}\``)
                .join(' ');
            const actionStr = `:prefix:${this.name}`;
            return {
                name: f.fmt(actionStr + ' ' + inputStr),
                value: f.fmt(x.description)
            };
        }));
        builder.setTimestamp();
        builder.setFooter({ text: 'Botiful' });
        return builder;
    }
}
exports.UsageBuilder = UsageBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQW1FO0FBRW5FLE1BQWEsU0FBUztJQWFyQixZQUNrQixNQUFjLEVBQ2QsU0FBaUIsRUFDakIsTUFBYztRQUZkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ2pCLFdBQU0sR0FBTixNQUFNLENBQVE7SUFDN0IsQ0FBQztJQUVHLEdBQUcsQ0FBRSxDQUFTO1FBQ3BCLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUE7UUFDdEIsS0FBSyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQzVDLFNBQVMsQ0FBQyxhQUFhLENBQ3ZCLEVBQUU7WUFDRixTQUFTLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7U0FDdEQ7UUFDRCxPQUFPLFNBQVMsQ0FBQTtJQUNqQixDQUFDOztBQTNCRiw4QkE0QkM7QUEzQk8sdUJBQWEsR0FBZ0Q7SUFDbkUsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTO0lBQ3ZDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO1lBQzdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFBO1NBQ2hDO2FBQU07WUFDTixPQUFPLFVBQVUsQ0FBQTtTQUNqQjtJQUNGLENBQUM7Q0FDUSxDQUFBO0FBbUJYLFNBQXNCLFFBQVEsQ0FDN0IsT0FBeUIsRUFDekIsU0FBaUIsQ0FBQzs7UUFFbEIsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDMUIsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM3QixDQUFDO0NBQUE7QUFORCw0QkFNQztBQU9ELE1BQWEsWUFBWTtJQUt4QixZQUFhLElBQVk7UUFIakIsZ0JBQVcsR0FBWSxTQUFTLENBQUE7UUFDdkIsYUFBUSxHQUFjLEVBQUUsQ0FBQTtRQUd4QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtJQUNqQixDQUFDO0lBRU0sZUFBZSxDQUFFLElBQVk7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7UUFDdkIsT0FBTyxJQUFJLENBQUE7SUFDWixDQUFDO0lBRU0sU0FBUyxDQUFFLEdBQUcsTUFBZ0I7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sSUFBSSxDQUFBO0lBQ1osQ0FBQztJQUVNLElBQUksQ0FBRSxRQUFnQjtRQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUE7UUFDOUQsT0FBTyxJQUFJLENBQUE7SUFDWixDQUFDO0lBRU0sT0FBTyxDQUFFLENBQVk7UUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQ2hDLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFDbkIsUUFBUSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUE7UUFDckMsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUk7WUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN0RSxPQUFPLENBQUMsU0FBUyxDQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxDQUFDLFdBQVcsSUFBSSxJQUFJO2dCQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFBO1lBQzdDLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNO2lCQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7aUJBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNYLE1BQU0sU0FBUyxHQUFHLFdBQVcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQ3hDLE9BQU87Z0JBQ04sSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7Z0JBQ3ZDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7YUFDM0IsQ0FBQTtRQUNGLENBQUMsQ0FBQyxDQUNGLENBQUE7UUFDRCxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDdEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLE9BQU8sT0FBTyxDQUFBO0lBQ2YsQ0FBQztDQUNEO0FBOUNELG9DQThDQyJ9