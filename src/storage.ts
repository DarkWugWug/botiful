import { LocalStorage } from "node-persist";

export type PrivateData = { [key: string]: any };
export class PrivateStorage<T extends PrivateData> {
    constructor(private store: LocalStorage, private namespace: string) {}

    private toNamespace(key: string) {
        return `${this.namespace}:${key}`;
    }

    /**
     * Sets value from each field of this object. Will not update a preexisting
     * value ONLY if undefined. Hence the 'gently'.
     * @param defaults Default values
     */
    public async _gentlyApplyDefaults(defaults: T) {
        for (const [key, value] of Object.entries(defaults)) {
            if (await this.getItem(key)) continue;
            this.setItem(key, value);
        }
    }

    public async getItem<K extends keyof T & string>(key: K) {
        const item: T[K] = await this.store.getItem(this.toNamespace(key));
        return item;
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
    ) {
        await this.store.setItem(this.toNamespace(key), value, { ttl });
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
    ) {
        await this.store.updateItem(this.toNamespace(key), value, { ttl });
    }

    /**
     * Updates a value
     * @param key key of object to update
     * @param value value to update
     * @param ttl milliseconds to keep record of
     * @returns True, if the key was successfully deleted. False, if the key
     *          didn't exist or didn't get delete.
     */
    public async removeItem<K extends keyof T & string>(key: K) {
        const result = await this.store.removeItem(this.toNamespace(key));
        return result.existed && result.removed;
    }

    /**
     * Removes all values from this store.
     */
    public async clear() {
        for (const key in this.keys()) {
            await this.store.removeItem(this.toNamespace(key));
        }
    }

    /**
     * Gets all values stored in this store.
     * @returns Values stored
     */
    public async asObject() {
        const object = (await this.keys()).reduce(async (collect, key) => {
            collect[key] = await this.getItem(key);
            return collect;
        }, {} as Record<string, any>);
        return object as T;
    }

    public async values() {
        return Object.keys(await this.asObject());
    }

    /**
     * Gets keys of this store
     * @returns Array of keys
     */
    public async keys() {
        const privilegedKeys = await this.store.keys();
        const namespaceRegExp = new RegExp(`^${this.toNamespace("")}`);
        const privateKeys = privilegedKeys
            .filter((x) => x.match(namespaceRegExp))
            .map((x) => x.replace(this.toNamespace(""), ""));
        return privateKeys as Array<keyof T & string>;
    }

    /**
     * Returns an object with only keys matching a string or RegExp.
     * @param pattern A matching pattern
     * @returns T with all non-matched keys removed
     */
    public async asObjectWithMatch<K extends keyof T & string>(
        pattern: K | RegExp
    ) {
        const object = await this.asObject();
        let objectWithMatch: Partial<T> = {};
        for (const [key, value] of Object.entries(object)) {
            if (key.match(pattern)) {
                objectWithMatch[key as keyof T] = value;
            }
        }
        return objectWithMatch;
    }

    /**
     * Returns the number of keys stored in this store.
     * @returns A number
     */
    public async length() {
        return (await this.store.keys()).length;
    }
}
