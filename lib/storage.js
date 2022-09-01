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
    values() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...yield this.store.values()];
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
    length() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.store.keys()).length;
        });
    }
}
exports.PrivateStorage = PrivateStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUdBLE1BQWEsY0FBYztJQUMxQixZQUE4QixLQUFtQixFQUFtQixTQUFpQjtRQUF2RCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQW1CLGNBQVMsR0FBVCxTQUFTLENBQVE7SUFBRyxDQUFDO0lBRWpGLFdBQVcsQ0FBRSxHQUFXO1FBQy9CLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2xDLENBQUM7SUFPWSxvQkFBb0IsQ0FBRSxRQUFXOztZQUM3QyxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFBLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSSxJQUFJO29CQUFFLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7YUFDbkU7UUFDRixDQUFDO0tBQUE7SUFFWSxPQUFPLENBQTZCLEdBQU07O1lBQ3RELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQzVELE9BQU8sSUFBSSxDQUFBO1FBQ1osQ0FBQztLQUFBO0lBUVksT0FBTyxDQUNuQixHQUFNLEVBQ04sS0FBUSxFQUNSLEdBQVk7O1lBRVosTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDaEUsQ0FBQztLQUFBO0lBUVksVUFBVSxDQUN0QixHQUFNLEVBQ04sS0FBUSxFQUNSLEdBQVk7O1lBRVosTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDbkUsQ0FBQztLQUFBO0lBVVksVUFBVSxDQUE2QixHQUFNOztZQUN6RCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUNqRSxPQUFPLE1BQU0sQ0FBQyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUN4QyxDQUFDO0tBQUE7SUFLWSxLQUFLOztZQUNqQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNwQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTthQUNsRDtRQUNGLENBQUM7S0FBQTtJQUVZLE1BQU07O1lBQ2xCLE9BQU8sQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLENBQUM7S0FBQTtJQU1ZLElBQUk7O1lBQ2hCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtZQUM5QyxNQUFNLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdELE1BQU0sV0FBVyxHQUFHLGNBQWM7aUJBQ2hDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLENBQUM7aUJBQy9DLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDakQsT0FBTyxXQUFXLENBQUE7UUFDbkIsQ0FBQztLQUFBO0lBTVksTUFBTTs7WUFDbEIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQTtRQUN4QyxDQUFDO0tBQUE7Q0FDRDtBQWpHRCx3Q0FpR0MifQ==