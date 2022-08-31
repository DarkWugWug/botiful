"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompleteConfig = exports.defaultConfig = void 0;
exports.defaultConfig = {
    prefix: '!',
    admin: 'Discord Admin',
    environment: process.env.NODE_ENV === undefined ? 'development' : process.env.NODE_ENV,
    loggerLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    loggerOutput: 'console',
    data: {}
};
function verifyConfig(config) {
    if (typeof config.token !== 'string') {
        throw new Error(`Expected Discord token in config, but found '${config.token}'`);
    }
    if (!Array.isArray(config.intents)) {
        throw new Error('Could not find intents for the bot to use.');
    }
}
function getCompleteConfig(config) {
    verifyConfig(config);
    return Object.assign(Object.assign({}, exports.defaultConfig), config);
}
exports.getCompleteConfig = getCompleteConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFtQmEsUUFBQSxhQUFhLEdBQXlEO0lBQ2xGLE1BQU0sRUFBRSxHQUFHO0lBQ1gsS0FBSyxFQUFFLGVBQWU7SUFDdEIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVE7SUFDdEYsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPO0lBQ3JFLFlBQVksRUFBRSxTQUFTO0lBQ3ZCLElBQUksRUFBRSxFQUFHO0NBQ1QsQ0FBQTtBQUVELFNBQVMsWUFBWSxDQUFFLE1BQVc7SUFDakMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELE1BQU0sQ0FBQyxLQUFlLEdBQUcsQ0FBQyxDQUFBO0tBQzFGO0lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ25DLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQTtLQUM3RDtBQUNGLENBQUM7QUFDRCxTQUFnQixpQkFBaUIsQ0FBRSxNQUF5QjtJQUMzRCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDcEIsdUNBQVkscUJBQWEsR0FBSyxNQUFNLEVBQUU7QUFDdkMsQ0FBQztBQUhELDhDQUdDIn0=