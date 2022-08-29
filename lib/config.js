"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompleteConfig = exports.default_config = void 0;
exports.default_config = {
    prefix: '!',
    admin: "Discord Admin",
    environment: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
    loggerLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
    loggerOutput: "console",
    data: {}
};
function verifyConfig(config) {
    if (typeof config.token !== "string") {
        throw new Error(`Expected Discord token in config, but found '${config.token}'`);
    }
    if (!Array.isArray(config.intents)) {
        throw new Error("Could not find intents for the bot to use.");
    }
}
function getCompleteConfig(config) {
    verifyConfig(config);
    return Object.assign(Object.assign({}, exports.default_config), config);
}
exports.getCompleteConfig = getCompleteConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUF1QmEsUUFBQSxjQUFjLEdBQXlEO0lBQ2hGLE1BQU0sRUFBRSxHQUFHO0lBQ1gsS0FBSyxFQUFFLGVBQWU7SUFDdEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYTtJQUN4RSxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU87SUFDckUsWUFBWSxFQUFFLFNBQVM7SUFDdkIsSUFBSSxFQUFFLEVBQUk7Q0FDYixDQUFDO0FBRUYsU0FBUyxZQUFZLENBQUMsTUFBVztJQUM3QixJQUFHLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7S0FDcEY7SUFDRCxJQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0tBQ2pFO0FBQ0wsQ0FBQztBQUNELFNBQWdCLGlCQUFpQixDQUFDLE1BQXlCO0lBRXZELFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQix1Q0FBWSxzQkFBYyxHQUFLLE1BQU0sRUFBRztBQUM1QyxDQUFDO0FBSkQsOENBSUMifQ==