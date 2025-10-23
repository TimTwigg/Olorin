export class SmartMap<keyType, valueType> extends Map<keyType, valueType> {
    constructor(entries?: readonly (readonly [keyType, valueType])[] | null) {
        super(entries);
    }

    dGet(key: keyType, defaultValue: valueType): any {
        return super.get(key) || defaultValue;
    }

    keysAsArray(): keyType[] {
        return Array.from(super.keys());
    }

    map<T>(callback: (value: valueType, key: keyType) => T): T[] {
        return Array.from(super.entries()).map(([key, value]) => callback(value, key));
    }

    copy(): SmartMap<keyType, valueType> {
        const _copy = new SmartMap<keyType, valueType>();
        for (const [key, value] of this.entries()) {
            _copy.set(key, value);
        }
        return _copy;
    }

    toJSON(): Record<string, valueType> {
        const obj: Record<string, valueType> = {};
        for (const [key, value] of this) {
            obj[String(key)] = value;
        }
        return obj;
    }

    public static fromMap<K extends string | number | symbol, V>(obj: Record<K, V>): SmartMap<K, V> {
        const map = new SmartMap<K, V>();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key as K, value as V);
        }
        return map;
    }
}
