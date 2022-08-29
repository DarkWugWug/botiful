"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = exports.botFormat = void 0;
const winston_1 = require("winston");
const fs_extra_1 = require("fs-extra");
const { MESSAGE } = require("triple-beam");
function formatNow() {
    const dt = new Date();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBa0Y7QUFDbEYsdUNBQTBDO0FBSTFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFJM0MsU0FBUyxTQUFTO0lBQ2QsTUFBTSxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUV0QixPQUFPLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMvQixDQUFDO0FBRVksUUFBQSxTQUFTLEdBQUcsSUFBQSxnQkFBTSxFQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDckMsTUFBTSxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFFBQVE7UUFDNUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1FBQ2QsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLFNBQVMsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLE1BQU0sT0FBTyxFQUFFLENBQUM7SUFDN0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFnQixVQUFVLENBQUMsTUFBaUM7SUFFeEQsTUFBTSxjQUFjLEdBQWtCO1FBQ2xDLE1BQU0sRUFBRSxJQUFBLGlCQUFTLEdBQUU7UUFDbkIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1FBQ3pCLFVBQVUsRUFBRSxFQUFJO0tBQ25CLENBQUM7SUFDRixJQUFHLE1BQU0sQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO1FBQ2xDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3hEO1NBQU07UUFDSCxJQUFBLHlCQUFjLEVBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztLQUN0RjtJQUNELE9BQU8sSUFBQSxzQkFBWSxFQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFkRCxnQ0FjQyJ9