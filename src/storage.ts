import { LocalStorage } from 'node-persist'

export interface PrivateData { [key: string]: any }
export class PrivateStorage<T extends PrivateData> {
	constructor (private readonly store: LocalStorage, private readonly namespace: string) {}

	private toNamespace (key: string): string {
		return `${this.namespace}:${key}`
	}

	/**
     * Sets value from each field of this object. Will not update a preexisting
     * value ONLY if undefined. Hence the 'gently'.
     * @param defaults Default values
     */
	public async _gentlyApplyDefaults (defaults: T): Promise<void> {
		for (const [key, value] of Object.entries(defaults)) {
			if (await this.getItem(key) == null) await this.setItem(key, value)
		}
	}

	public async getItem<K extends keyof T & string>(key: K): Promise<T[K] | undefined> {
		const item = await this.store.getItem(this.toNamespace(key))
		return item
	}

	/**
     * Stores a value
     * @param key key of object to store
     * @param value value to store
     * @param ttl milliseconds to keep record of
     */
	public async setItem<K extends keyof T & string, V extends T[K]>(
		key: K,
		value: V,
		ttl?: number
	): Promise<void> {
		await this.store.setItem(this.toNamespace(key), value, { ttl })
	}

	/**
     * Updates a value
     * @param key key of object to update
     * @param value value to update
     * @param ttl milliseconds to keep record of
     */
	public async updateItem<K extends keyof T & string, V extends T[K]>(
		key: K,
		value: V,
		ttl?: number
	): Promise<void> {
		await this.store.updateItem(this.toNamespace(key), value, { ttl })
	}

	/**
     * Updates a value
     * @param key key of object to update
     * @param value value to update
     * @param ttl milliseconds to keep record of
     * @returns True, if the key was successfully deleted. False, if the key
     *          didn't exist or didn't get delete.
     */
	public async removeItem<K extends keyof T & string>(key: K): Promise<boolean> {
		const result = await this.store.removeItem(this.toNamespace(key))
		return result.existed && result.removed
	}

	/**
     * Removes all values from this store.
     */
	public async clear (): Promise<void> {
		for (const key of await this.keys()) {
			await this.store.removeItem(this.toNamespace(key))
		}
	}

	public async values (): Promise<any[]> {
		return [...await this.store.values()]
	}

	/**
     * Gets keys of this store
     * @returns Array of keys
     */
	public async keys (): Promise<string[]> {
		const privilegedKeys = await this.store.keys()
		const namespaceRegExp = new RegExp(`${this.toNamespace('')}`)
		const privateKeys = privilegedKeys
			.filter((x) => x.match(namespaceRegExp) != null)
			.map((x) => x.replace(this.toNamespace(''), ''))
		return privateKeys
	}

	/**
     * Returns the number of keys stored in this store.
     * @returns A number
     */
	public async length (): Promise<number> {
		return (await this.store.keys()).length
	}
}
