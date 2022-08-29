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
