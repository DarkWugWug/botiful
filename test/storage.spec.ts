import { Store } from '..'
import persist from 'node-persist'

describe('Storage', () => {
	beforeAll(async () => {
		await persist.init({ dir: './test/.data' })
	})
	afterEach(async () => {
		await persist.clear()
	})
	it('uses namespace prefix for all operations', async () => {
		const namespace = 'test-jest'
		const store = new Store(persist, namespace)
		const item = { key: 'id', value: 56789 }
		await store.setItem(item.key, item.value)
		let privilegedKeys = await persist.keys()
		expect(privilegedKeys.length).toBe(1)
		expect(privilegedKeys).toEqual(
			expect.arrayContaining([`${namespace}:${item.key}`])
		)
		const otherItem = { key: 'other', value: 1234 }
		await store.setItem(otherItem.key, otherItem.value)
		await store.removeItem(item.key)
		privilegedKeys = await persist.keys()
		expect(privilegedKeys.length).toBe(1)
		expect(privilegedKeys).toEqual(
			expect.arrayContaining([`${namespace}:${otherItem.key}`])
		)
		const privilegedItem = { key: 'globals', value: 'cant touch this' }
		await persist.setItem(privilegedItem.key, privilegedItem.value)
		await store.removeItem(privilegedItem.key) // Shouldn't do anything
		privilegedKeys = await persist.keys()
		expect(privilegedKeys.length).toBe(2)
		expect(privilegedKeys).toEqual(
			expect.arrayContaining([`${namespace}:${otherItem.key}`, `${privilegedItem.key}`])
		)
		await store.clear()
		privilegedKeys = await persist.keys()
		expect(privilegedKeys.length).toBe(1)
		expect(privilegedKeys).toEqual(
			expect.arrayContaining([`${privilegedItem.key}`])
		)
	})
	it('should not cause side-effects to the data (i.e. what goes in is exactly what comes out)', async () => {
		// NOTE: Will not support storing RegExs
		const store = new Store(persist, 'test-jest')
		const validEntries = [
			{ key: 'string', value: 'record1', update: 'record-one' },
			{ key: 'null', value: null, update: -100 },
			{ key: 'undefined', value: undefined, update: [] },
			{ key: 'object', value: { what: 'in', the: 43.20, hecks: ['abc', 123] }, update: { what: 'in', the: 43.20 } },
			{ key: 'one', value: { key: 'one', value: 1 } }
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
	it('public state api is consistent with expectations (.keys(), .values(), .length)', async () => {
		const store = new Store<any>(persist, 'test-jest')
		const entries = [
			{ key: 'one', value: '1' },
			{ key: 'blue', value: 12345 },
			{ key: 'three', value: { key: 'one', value: 1 } }
		]
		// Populate store
		for (const { key, value } of entries) {
			await store.setItem(key, value)
		}
		// Test keys
		const expectedKeys = entries.map((x) => x.key)
		const storeKeys = await store.keys()
		expect(storeKeys.sort()).toStrictEqual(expectedKeys.sort()) // Sort because ordering doesn't matter to the Store API but does to Jest
		// Test values
		const expectedValues = entries.map((x) => x.value)
		const storeValues = await store.values()
		expect(storeValues.length).toEqual(expectedValues.length)
		expect(storeValues).toEqual(
			expect.arrayContaining(expectedValues)
		)
		// Test length
		expect(await store.length()).toBe(entries.length)
	})
})
