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
    constructor(prefix, adminRole) {
        this.prefix = prefix;
        this.adminRole = adminRole;
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
    ':adminRole': (self) => self.adminRole
};
function doTyping(channel, typing = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        yield channel.sendTyping();
        setTimeout(() => { }, typing);
    });
}
exports.doTyping = doTyping;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRUEsTUFBYSxTQUFTO0lBTXJCLFlBQThCLE1BQWMsRUFBbUIsU0FBaUI7UUFBbEQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFtQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBQUcsQ0FBQztJQUU3RSxHQUFHLENBQUUsQ0FBUztRQUNwQixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFBO1FBQ3RCLEtBQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUM1QyxTQUFTLENBQUMsYUFBYSxDQUN2QixFQUFFO1lBQ0YsU0FBUyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQ3REO1FBQ0QsT0FBTyxTQUFTLENBQUE7SUFDakIsQ0FBQzs7QUFoQkYsOEJBaUJDO0FBaEJPLHVCQUFhLEdBQWdEO0lBQ25FLFVBQVUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU07SUFDakMsWUFBWSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUztDQUM3QixDQUFBO0FBZVgsU0FBc0IsUUFBUSxDQUM3QixPQUF5QixFQUN6QixTQUFpQixDQUFDOztRQUVsQixNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUMxQixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQzdCLENBQUM7Q0FBQTtBQU5ELDRCQU1DIn0=