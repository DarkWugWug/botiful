import { Store } from '..'
import persist from 'node-persist'

describe('Storage', () => {
	beforeAll(async () => {
		await persist.init({ dir: './test/.data' })
	})
	afterEach(async () => {
		await persist.clear()
	})
	it('should not cause side-effects to the data (i.e. what goes in is exactly what comes out)', async () => {
		// NOTE: Will not support storing RegExs
		const store = new Store(persist, 'test-jest')
		const validEntries = [
			{ key: 'string', value: 'record1', update: 'record-one' },
			{ key: 'null', value: null, update: -100 },
			{ key: 'undefined', value: undefined, update: [] },
			{ key: 'object', value: { what: 'in', the: 43.20, heckz: ['abc', 123] }, update: { what: 'in', the: 43.20 } }
		]
		for (const { key, value, update } of validEntries) {
			expect(await store.getItem(key)).toBeUndefined()
			await store.setItem(key, value)
			expect(await store.getItem(key)).toStrictEqual(value)
			await store.updateItem(key, update)
			expect(await store.getItem(key)).toStrictEqual(update)
			await store.removeItem(key)
			expect(await store.getItem(key)).toBeUndefined()
		}
	})
	it('applies defaults without overwriting existing data', async () => {
		const store = new Store<typeof defaults>(persist, 'test-jest')
		const defaults = {
			id: 'defaultId',
			base: 10
		}
		const preexistingId = 'aNewValue'
		await store.setItem('id', preexistingId)
		await store._gentlyApplyDefaults(defaults)
		expect(await store.getItem('id')).toStrictEqual(preexistingId)
		expect(await store.getItem('base')).toStrictEqual(10)
	})
	it('public state api is consistent with expectations (e.g. .keys() returns all keys)', async () => {
		const store = new Store<any>(persist, 'test-jest')
		const entries = [
			{ key: 'one', value: '1' },
			{ key: 'blue', value: 12345 },
			{ key: 'three', value: { key: 'one', value: 1 } }
		]
		const expectedKeys = entries.map((x) => x.key)
		const expectedValues = entries.map((x) => x.value)
		for (const { key, value } of entries) {
			await store.setItem(key, value)
		}
		expect(await store.keys()).toStrictEqual(expectedKeys)
	})
})
