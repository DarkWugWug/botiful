"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = exports.botFormat = void 0;
const winston_1 = require("winston");
const fs_extra_1 = require("fs-extra");
const { MESSAGE } = require("triple-beam");
function formatNow() {
    const dt = new Date();
    // return `${dt.getMonth()}/${dt.getDate()}/${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`;
    return dt.toLocaleString();
}
exports.botFormat = (0, winston_1.format)((info) => {
    const message = typeof info.message === "string"
        ? info.message
        : '\n' + JSON.stringify(info.message, null, 4);
    info[MESSAGE] = `${formatNow()} [${info.level}]: ${message}`;
    return info;
});
function initLogger(config) {
    const logger_options = {
        format: (0, exports.botFormat)(),
        level: config.loggerLevel,
        transports: [],
    };
    if (config.loggerOutput === "console") {
        logger_options.transports = new winston_1.transports.Console();
    }
    else {
        (0, fs_extra_1.ensureFileSync)(config.loggerOutput);
        logger_options.transports = new winston_1.transports.File({ filename: config.loggerOutput });
    }
    return (0, winston_1.createLogger)(logger_options);
}
exports.initLogger = initLogger;
