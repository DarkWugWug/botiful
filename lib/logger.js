"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = void 0;
const winston_1 = require("winston");
const fs_extra_1 = require("fs-extra");
const { combine, colorize, timestamp, align, printf } = winston_1.format;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBaUY7QUFDakYsdUNBQXlDO0FBR3pDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsZ0JBQU0sQ0FBQTtBQUU5RCxTQUFnQixVQUFVLENBQUUsTUFBaUM7SUFDNUQsTUFBTSxhQUFhLEdBQWtCO1FBQ3BDLE1BQU0sRUFBRSxPQUFPLENBQ2QsUUFBUSxFQUFFLEVBR1YsU0FBUyxFQUFFLEVBQ1gsS0FBSyxFQUFFLEVBQ1AsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFtQixNQUFNLElBQUksQ0FBQyxLQUFLLE1BQU0sSUFBSSxDQUFDLE9BQWlCLEVBQUUsQ0FBQyxDQUM1RjtRQUNELEtBQUssRUFBRSxNQUFNLENBQUMsV0FBVztRQUN6QixVQUFVLEVBQUUsRUFBRTtLQUNkLENBQUE7SUFDRCxJQUFJLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO1FBQ3RDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQ25EO1NBQU07UUFDTixJQUFBLHlCQUFjLEVBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ25DLGFBQWEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQTtLQUNqRjtJQUNELE9BQU8sSUFBQSxzQkFBWSxFQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ25DLENBQUM7QUFwQkQsZ0NBb0JDIn0=