"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.DiscordBot = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const logger_1 = require("./logger");
const actions_1 = require("./actions");
const middleware_1 = require("./middleware");
__exportStar(require("./foundation"), exports);
class DiscordBot {
    constructor(options) {
        this._actions = {};
        this.middleware = [];
        const config = (0, config_1.getCompleteConfig)(options);
        this.log = (0, logger_1.initLogger)(config);
        this.config = config.data;
        this.prefix = config.prefix;
        this.token = config.token;
        this.adminRole = config.admin;
        this.client = new discord_js_1.Client({
            intents: config.intents
        });
    }
    getAction(command) { return this._actions[command]; }
    getActions() { return Object.values(this._actions); }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug("Bot shutting down...");
            return Promise.all(this.getActions()
                .filter(action => action.cleanup)
                .map(action => action.cleanup()))
                .then(() => this.client.destroy())
                .then(() => this.log.info("Bot logged out!"));
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            this.log.info("Starting Discord Bot...");
            if (this.token.length === 0) {
                this.log.error("No token found!");
            }
            return this.client.login(this.token).then(() => {
                var _a;
                this.log.info(`${(_a = this.client.user) === null || _a === void 0 ? void 0 : _a.username} has logged in and started!`);
            }).catch((err) => { this.log.error(err); });
        });
    }
    runAction(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!msg.content || !msg.author) {
                return;
            }
            if (!msg.content.startsWith(this.prefix)
                || msg.author.equals(this.client.user)) {
                return;
            }
            const cmd_regex = /("[^"]*"|\S+)/g;
            let cmd_args = (msg.content.match(cmd_regex) || [])
                .map((arg) => /^".*"$/.test(arg)
                ? arg.substring(1, arg.length - 2)
                : arg);
            const cmd = cmd_args[0].substring(1);
            cmd_args = cmd_args.slice(1);
            let reply = `'${cmd}' is not a valid command!`;
            const cmd_action = this._actions[cmd];
            if (cmd_action) {
                const authorized = yield this.isAuthorized(cmd_action, msg);
                if (authorized) {
                    const str = yield cmd_action.run(cmd_args, msg, this);
                    reply = (str && (str.length > 0)) ? str : "";
                }
                else {
                    reply = "You are not authorized to use this command!";
                }
            }
            if (reply.length > 0) {
                msg.channel.send(reply);
            }
        });
    }
    loadActions(actions_param) {
        if (actions_param instanceof Array) {
            actions_param.forEach((action) => { this._actions[action.name] = action; });
        }
        else if (typeof actions_param === "object") {
            Object.assign(this._actions, actions_param);
        }
    }
    loadMiddleware(middleware_param) {
        if (middleware_param instanceof Array) {
            this.middleware = this.middleware.concat(middleware_param);
        }
        else {
            this.middleware.push(middleware_param);
        }
    }
    init() {
        this.log.info("Initializing Discord Bot...");
        this.loadActions([actions_1.helpCommand, actions_1.manCommand]);
        this.loadMiddleware([middleware_1.adminMiddleware, middleware_1.rolesMiddleware, middleware_1.usersMiddleware]);
        this.client.on("messageCreate", (msg) => this.runAction(msg));
        this.client.on("messageUpdate", (oldmsg, newmsg) => {
            if ((oldmsg.content === newmsg.content)
                || (newmsg.embeds && !oldmsg.embeds)
                || (newmsg.embeds.length > 0 && oldmsg.embeds.length === 0)) {
                return;
            }
            this.runAction(newmsg);
        });
        return Promise.all(this.middleware
            .filter((mw) => mw.init)
            .map((mw) => mw.init())).then(() => Promise.all(this.getActions()
            .filter((action) => action.init)
            .map((action) => action.init()))).then(() => { });
    }
    isAuthorized(action, message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const mw of this.middleware) {
                if (!(yield mw.apply(action, message, this))) {
                    return false;
                }
            }
            return true;
        });
    }
}
exports.DiscordBot = DiscordBot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwyQ0FBNkQ7QUFFN0QscUNBQWdFO0FBRWhFLHFDQUFzQztBQUV0Qyx1Q0FBb0Q7QUFDcEQsNkNBQWlGO0FBRWpGLCtDQUE2QjtBQUU3QixNQUFhLFVBQVU7SUFZbkIsWUFBbUIsT0FBMEI7UUFKckMsYUFBUSxHQUFjLEVBQUksQ0FBQztRQUMzQixlQUFVLEdBQWtCLEVBQUksQ0FBQztRQUtyQyxNQUFNLE1BQU0sR0FBRyxJQUFBLDBCQUFpQixFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBQSxtQkFBVSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksbUJBQU0sQ0FBQztZQUNyQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87U0FDMUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNNLFNBQVMsQ0FBQyxPQUFlLElBQUksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RCxVQUFVLEtBQUssT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFL0MsTUFBTTs7WUFFZixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lB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