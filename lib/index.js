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
