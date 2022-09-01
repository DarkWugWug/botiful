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
exports.PrivateStorage = void 0;
class PrivateStorage {
    constructor(store, namespace) {
        this.store = store;
        this.namespace = namespace;
    }
    toNamespace(key) {
        return `${this.namespace}:${key}`;
    }
    _gentlyApplyDefaults(defaults) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, value] of Object.entries(defaults)) {
                if ((yield this.getItem(key)) == null)
                    yield this.setItem(key, value);
            }
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.store.getItem(this.toNamespace(key));
            return item;
        });
    }
    setItem(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.setItem(this.toNamespace(key), value, { ttl });
        });
    }
    updateItem(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.store.updateItem(this.toNamespace(key), value, { ttl });
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.store.removeItem(this.toNamespace(key));
            return result.existed && result.removed;
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const key of yield this.keys()) {
                yield this.store.removeItem(this.toNamespace(key));
            }
        });
    }
    asObject() {
        return __awaiter(this, void 0, void 0, function* () {
            const object = (yield this.keys()).reduce((collect, key) => __awaiter(this, void 0, void 0, function* () {
                collect[key] = yield this.getItem(key);
                return collect;
            }), {});
            return object;
        });
    }
    values() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.values(yield this.asObject());
        });
    }
    keys() {
        return __awaiter(this, void 0, void 0, function* () {
            const privilegedKeys = yield this.store.keys();
            const namespaceRegExp = new RegExp(`${this.toNamespace('')}`);
            const privateKeys = privilegedKeys
                .filter((x) => x.match(namespaceRegExp) != null)
                .map((x) => x.replace(this.toNamespace(''), ''));
            return privateKeys;
        });
    }
    asObjectWithMatch(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            const object = yield this.asObject();
            const objectWithMatch = {};
            for (const [key, value] of Object.entries(object)) {
                if (key.match(pattern) != null) {
                    objectWithMatch[key] = value;
                }
            }
            return objectWithMatch;
        });
    }
    length() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.store.keys()).length;
        });
    }
}
exports.PrivateStorage = PrivateStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEsY0FBYztJQUMxQixZQUE4QixLQUFtQixFQUFtQixTQUFpQjtRQUF2RCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQW1CLGNBQVMsR0FBVCxTQUFTLENBQVE7SUFBRyxDQUFDO0lBRWpGLFdBQVcsQ0FBRSxHQUFXO1FBQy9CLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2xDLENBQUM7SUFPWSxvQkFBb0IsQ0FBRSxRQUFXOztZQUM3QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFBLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSSxJQUFJO29CQUFFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7YUFDbkU7UUFDRixDQUFDO0tBQUE7SUFFWSxPQUFPLENBQTZCLEdBQU07O1lBQ3RELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQzVELE9BQU8sSUFBSSxDQUFBO1FBQ1osQ0FBQztLQUFBO0lBUVksT0FBTyxDQUNuQixHQUFNLEVBQ04sS0FBUSxFQUNSLEdBQVk7O1lBRVosTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDaEUsQ0FBQztLQUFBO0lBUVksVUFBVSxDQUN0QixHQUFNLEVBQ04sS0FBUSxFQUNSLEdBQVk7O1lBRVosTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDbkUsQ0FBQztLQUFBO0lBVVksVUFBVSxDQUE2QixHQUFNOztZQUN6RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUNqRSxPQUFPLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUN4QyxDQUFDO0tBQUE7SUFLWSxLQUFLOztZQUNqQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNwQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTthQUNsRDtRQUNGLENBQUM7S0FBQTtJQU1ZLFFBQVE7O1lBQ3BCLE1BQU0sTUFBTSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQXNCLENBQU8sT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUN0QyxPQUFPLE9BQU8sQ0FBQTtZQUNmLENBQUMsQ0FBQSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1lBQ04sT0FBTyxNQUFXLENBQUE7UUFDbkIsQ0FBQztLQUFBO0lBRVksTUFBTTs7WUFDbEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDNUMsQ0FBQztLQUFBO0lBTVksSUFBSTs7WUFDaEIsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO1lBQzlDLE1BQU0sZUFBZSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDN0QsTUFBTSxXQUFXLEdBQUcsY0FBYztpQkFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQztpQkFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUNqRCxPQUFPLFdBQVcsQ0FBQTtRQUNuQixDQUFDO0tBQUE7SUFPWSxpQkFBaUIsQ0FDN0IsT0FBbUI7O1lBRW5CLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBQ3BDLE1BQU0sZUFBZSxHQUFlLEVBQUUsQ0FBQTtZQUN0QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRTtvQkFDL0IsZUFBZSxDQUFDLEdBQWMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtpQkFDdkM7YUFDRDtZQUNELE9BQU8sZUFBZSxDQUFBO1FBQ3ZCLENBQUM7S0FBQTtJQU1ZLE1BQU07O1lBQ2xCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFDeEMsQ0FBQztLQUFBO0NBQ0Q7QUEvSEQsd0NBK0hDIn0=