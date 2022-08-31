"use strict";
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
exports.doTyping = exports.Formatter = void 0;
class Formatter {
    constructor(prefix, adminRole, client) {
        this.prefix = prefix;
        this.adminRole = adminRole;
        this.client = client;
    }
    fmt(x) {
        let formatStr = `${x}`;
        for (const [pattern, write] of Object.entries(Formatter.substitutions)) {
            formatStr = formatStr.replaceAll(pattern, write(this));
        }
        return formatStr;
    }
}
exports.Formatter = Formatter;
Formatter.substitutions = {
    ':prefix:': (self) => self.prefix,
    ':adminRole': (self) => self.adminRole,
    ':botName': (self) => {
        if (self.client.user != null) {
            return self.client.user.username;
        }
        else {
            return 'This bot';
        }
    }
};
function doTyping(channel, typing = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        yield channel.sendTyping();
        setTimeout(() => { }, typing);
    });
}
exports.doTyping = doTyping;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRUEsTUFBYSxTQUFTO0lBYXJCLFlBQ2tCLE1BQWMsRUFDZCxTQUFpQixFQUNqQixNQUFjO1FBRmQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUM3QixDQUFDO0lBRUcsR0FBRyxDQUFFLENBQVM7UUFDcEIsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQTtRQUN0QixLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FDNUMsU0FBUyxDQUFDLGFBQWEsQ0FDdkIsRUFBRTtZQUNGLFNBQVMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtTQUN0RDtRQUNELE9BQU8sU0FBUyxDQUFBO0lBQ2pCLENBQUM7O0FBM0JGLDhCQTRCQztBQTNCTyx1QkFBYSxHQUFnRDtJQUNuRSxVQUFVLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNO0lBQ2pDLFlBQVksRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVM7SUFDdEMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDcEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7U0FDaEM7YUFBTTtZQUNOLE9BQU8sVUFBVSxDQUFBO1NBQ2pCO0lBQ0YsQ0FBQztDQUNRLENBQUE7QUFtQlgsU0FBc0IsUUFBUSxDQUM3QixPQUF5QixFQUN6QixTQUFpQixDQUFDOztRQUVsQixNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQzdCLENBQUM7Q0FBQTtBQU5ELDRCQU1DIn0=