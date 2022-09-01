import { LocalStorage } from 'node-persist';
export interface PrivateData {
    [key: string]: any;
}
export declare class PrivateStorage<T extends PrivateData> {
    private readonly store;
    private readonly namespace;
    constructor(store: LocalStorage, namespace: string);
    private toNamespace;
    _gentlyApplyDefaults(defaults: T): Promise<void>;
    getItem<K extends keyof T & string>(key: K): Promise<T[K] | undefined>;
    setItem<K extends keyof T & string, V extends T[K]>(key: K, value: V, ttl?: number): Promise<void>;
    updateItem<K extends keyof T & string, V extends T[K]>(key: K, value: V, ttl?: number): Promise<void>;
    removeItem<K extends keyof T & string>(key: K): Promise<boolean>;
    clear(): Promise<void>;
    asObject(): Promise<T>;
    values(): Promise<any[]>;
    keys(): Promise<string[]>;
    asObjectWithMatch<K extends keyof T & string>(pattern: K | RegExp): Promise<Partial<T>>;
    length(): Promise<number>;
}
//# sourceMappingURL=storage.d.ts.map