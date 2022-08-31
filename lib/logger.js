"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = void 0;
const winston_1 = require("winston");
const fs_extra_1 = require("fs-extra");
function formatNow() {
    const dt = new Date();
    return dt.toLocaleString();
}
function botifulFormat(info, opts) {
    const message = typeof info.message === 'string'
        ? info.message
        : '\n' + JSON.stringify(info.message, null, 2);
    info.message = `${formatNow()} [${info.level}]: ${message}`;
    return info;
}
function initLogger(config) {
    const loggerOptions = {
        format: (0, winston_1.format)(botifulFormat)(),
        level: config.loggerLevel,
        transports: []
    };
    if (config.loggerOutput === 'console') {
        loggerOptions.transports = new winston_1.transports.Console();
    }
    else {
        (0, fs_extra_1.ensureFileSync)(config.loggerOutput);
        loggerOptions.transports = new winston_1.transports.File({ filename: config.loggerOutput });
    }
    return (0, winston_1.createLogger)(loggerOptions);
}
exports.initLogger = initLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBaUY7QUFFakYsdUNBQXlDO0FBSXpDLFNBQVMsU0FBUztJQUNqQixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO0lBQ3JCLE9BQU8sRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQzNCLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBRSxJQUF1QixFQUFFLElBQVU7SUFDMUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFFBQVE7UUFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1FBQ2QsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxTQUFTLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxNQUFNLE9BQU8sRUFBRSxDQUFBO0lBQzNELE9BQU8sSUFBSSxDQUFBO0FBQ1osQ0FBQztBQUVELFNBQWdCLFVBQVUsQ0FBRSxNQUFpQztJQUM1RCxNQUFNLGFBQWEsR0FBa0I7UUFDcEMsTUFBTSxFQUFFLElBQUEsZ0JBQU0sRUFBQyxhQUFhLENBQUMsRUFBRTtRQUMvQixLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7UUFDekIsVUFBVSxFQUFFLEVBQUU7S0FDZCxDQUFBO0lBQ0QsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtRQUN0QyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNuRDtTQUFNO1FBQ04sSUFBQSx5QkFBYyxFQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNuQyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUE7S0FDakY7SUFDRCxPQUFPLElBQUEsc0JBQVksRUFBQyxhQUFhLENBQUMsQ0FBQTtBQUNuQyxDQUFDO0FBYkQsZ0NBYUMifQ==