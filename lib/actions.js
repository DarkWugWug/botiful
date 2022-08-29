"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manCommand = exports.helpCommand = void 0;
exports.helpCommand = {
    name: "help",
    description: "Displays a list of all commands available to you",
    admin: false,
    run: (_args, _msg, bot) => {
        return bot.getActions().map((action) => `${action.name} : ${action.description}`).join('\n');
    }
};
exports.manCommand = {
    name: "man",
    description: "Displays the manual entry for a specified command",
    man: "!man <command>",
    admin: false,
    run: (args, msg, bot) => {
        if (!args[0]) {
            msg.channel.send("You must pass in a command to look up the manual entry for.");
            return;
        }
        const command = bot.getAction(args[0]);
        if (!command) {
            msg.channel.send(`Could not find the command '${args[0]}'.`);
            return;
        }
        if (!command.man) {
            msg.channel.send(`The '${args[0]}' command does not have a manual entry.`);
            return;
        }
        msg.channel.send(command.man);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlhLFFBQUEsV0FBVyxHQUN4QjtJQUNJLElBQUksRUFBRSxNQUFNO0lBQ1osV0FBVyxFQUFFLGtEQUFrRDtJQUMvRCxLQUFLLEVBQUUsS0FBSztJQUNaLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdEIsT0FBTyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pHLENBQUM7Q0FDSixDQUFDO0FBRVcsUUFBQSxVQUFVLEdBQ3ZCO0lBQ0ksSUFBSSxFQUFFLEtBQUs7SUFDWCxXQUFXLEVBQUUsbURBQW1EO0lBQ2hFLEdBQUcsRUFBRSxnQkFBZ0I7SUFDckIsS0FBSyxFQUFFLEtBQUs7SUFDWixHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3BCLElBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDVCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1lBQ2hGLE9BQU87U0FDVjtRQUNELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBRyxDQUFDLE9BQU8sRUFBRTtZQUNULEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELE9BQU87U0FDVjtRQUNELElBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQ2IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFDM0UsT0FBTztTQUNWO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDSixDQUFDIn0=