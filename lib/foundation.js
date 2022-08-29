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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm91bmRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9mb3VuZGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQXFDQSxTQUFnQixZQUFZLENBQUMsWUFBaUI7SUFFMUMsSUFBRyxPQUFPLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFBRSxPQUFPLEtBQUssQ0FBQztLQUFFO0lBQUEsQ0FBQztJQUN2RCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdkQsTUFBTSxpQkFBaUIsR0FBRyxDQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRyxPQUFPLGlCQUFpQixJQUFJLENBQUMsT0FBTyxZQUFZLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQ3pFLENBQUM7QUFORCxvQ0FNQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUFzQztJQUU3RCxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUM7QUFDTixDQUFDO0FBUkQsZ0NBUUM7QUFTRCxTQUFnQixnQkFBZ0IsQ0FBQyxnQkFBcUI7SUFFbEQsSUFBRyxPQUFPLGdCQUFnQixLQUFLLFFBQVEsRUFBRTtRQUFFLE9BQU8sS0FBSyxDQUFDO0tBQUU7SUFBQSxDQUFDO0lBQzNELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzNELE9BQU8sT0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3hELENBQUM7QUFMRCw0Q0FLQyJ9