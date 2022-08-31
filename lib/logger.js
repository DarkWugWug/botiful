"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = void 0;
const winston_1 = require("winston");
const fs_extra_1 = require("fs-extra");
const { combine, colorize, timestamp, align, printf, prettyPrint } = winston_1.format;
function initLogger(config) {
    const loggerOptions = {
        format: combine(colorize(), timestamp(), align(), printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBaUY7QUFDakYsdUNBQXlDO0FBR3pDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLGdCQUFNLENBQUE7QUFFM0UsU0FBZ0IsVUFBVSxDQUFFLE1BQWlDO0lBQzVELE1BQU0sYUFBYSxHQUFrQjtRQUNwQyxNQUFNLEVBQUUsT0FBTyxDQUNkLFFBQVEsRUFBRSxFQUdWLFNBQVMsRUFBRSxFQUNYLEtBQUssRUFBRSxFQUNQLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBbUIsTUFBTSxJQUFJLENBQUMsS0FBSyxNQUFNLElBQUksQ0FBQyxPQUFpQixFQUFFLENBQUMsQ0FDNUY7UUFDRCxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVc7UUFDekIsVUFBVSxFQUFFLEVBQUU7S0FDZCxDQUFBO0lBQ0QsSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtRQUN0QyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNuRDtTQUFNO1FBQ04sSUFBQSx5QkFBYyxFQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNuQyxhQUFhLENBQUMsVUFBVSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUE7S0FDakY7SUFDRCxPQUFPLElBQUEsc0JBQVksRUFBQyxhQUFhLENBQUMsQ0FBQTtBQUNuQyxDQUFDO0FBcEJELGdDQW9CQyJ9