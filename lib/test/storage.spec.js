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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const node_persist_1 = __importDefault(require("node-persist"));
describe('Storage', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield node_persist_1.default.init({ dir: './test/.data' });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield node_persist_1.default.clear();
    }));
    it('should not cause side-effects to the data (i.e. what goes in is exactly what comes out)', () => __awaiter(void 0, void 0, void 0, function* () {
        const store = new __1.Store(node_persist_1.default, 'test-jest');
        const validEntries = [
            { key: 'string', value: 'record1', update: 'record-one' },
            { key: 'null', value: null, update: -100 },
            { key: 'undefined', value: undefined, update: [] },
            { key: 'object', value: { what: 'in', the: 43.20, heckz: ['abc', 123] }, update: { what: 'in', the: 43.20 } }
        ];
        for (const { key, value, update } of validEntries) {
            expect(yield store.getItem(key)).toBeUndefined();
            yield store.setItem(key, value);
            expect(yield store.getItem(key)).toStrictEqual(value);
            yield store.updateItem(key, update);
            expect(yield store.getItem(key)).toStrictEqual(update);
            yield store.removeItem(key);
            expect(yield store.getItem(key)).toBeUndefined();
        }
    }));
    it('applies defaults without overwriting existing data', () => __awaiter(void 0, void 0, void 0, function* () {
        const store = new __1.Store(node_persist_1.default, 'test-jest');
        const defaults = {
            id: 'defaultId',
            base: 10
        };
        const preexistingId = 'aNewValue';
        yield store.setItem('id', preexistingId);
        yield store._gentlyApplyDefaults(defaults);
        expect(yield store.getItem('id')).toStrictEqual(preexistingId);
        expect(yield store.getItem('base')).toStrictEqual(10);
    }));
    it('public state api is consistent with expectations (e.g. .keys() returns all keys)', () => __awaiter(void 0, void 0, void 0, function* () {
        const store = new __1.Store(node_persist_1.default, 'test-jest');
        const entries = [
            { key: 'one', value: '1' },
            { key: 'blue', value: 12345 },
            { key: 'three', value: { key: 'one', value: 1 } }
        ];
        const expectedKeys = entries.map((x) => x.key);
        const expectedValues = entries.map((x) => x.value);
        for (const { key, value } of entries) {
            yield store.setItem(key, value);
        }
        expect(yield store.keys()).toStrictEqual(expectedKeys);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9zdG9yYWdlLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7QUFDMUIsZ0VBQWtDO0FBRWxDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBQ3hCLFNBQVMsQ0FBQyxHQUFTLEVBQUU7UUFDcEIsTUFBTSxzQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFDRixTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ3BCLE1BQU0sc0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLHlGQUF5RixFQUFFLEdBQVMsRUFBRTtRQUV4RyxNQUFNLEtBQUssR0FBRyxJQUFJLFNBQUssQ0FBQyxzQkFBTyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQzdDLE1BQU0sWUFBWSxHQUFHO1lBQ3BCLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUU7WUFDekQsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFO1lBQzFDLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDbEQsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxF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