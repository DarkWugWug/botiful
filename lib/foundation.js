"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMiddleware = exports.subcommand = exports.verifyAction = void 0;
function verifyAction(maybe_action) {
    if (typeof maybe_action !== "object") {
        return false;
    }
    ;
    const props = Object.getOwnPropertyNames(maybe_action);
    const hasRequiredFields = ["name", "description", "admin", "run"].every(p => props.includes(p));
    return hasRequiredFields && (typeof maybe_action.run === "function");
}
exports.verifyAction = verifyAction;
function subcommand(subcmds) {
    return (args, msg, bot) => {
        const subcmd_name = args[0];
        const subcmd_args = args.slice(1);
        subcmds[subcmd_name](subcmd_args, msg, bot);
    };
}
exports.subcommand = subcommand;
function verifyMiddleware(maybe_middleware) {
    if (typeof maybe_middleware !== "object") {
        return false;
    }
    ;
    const props = Object.getOwnPropertyNames(maybe_middleware);
    return typeof maybe_middleware.apply === "function";
}
exports.verifyMiddleware = verifyMiddleware;
