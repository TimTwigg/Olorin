export class SmartMap<keyType, valueType> extends Map {
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
        let _copy = new SmartMap<keyType, valueType>();
        for (let [key, value] of this.entries()) {
            _copy.set(key, value);
        }
        return _copy;
    }

    public static fromMap<K extends string | number | symbol, V>(obj: Record<K, V>): SmartMap<K, V> {
        const map = new SmartMap<K, V>();
        for (const [key, value] of Object.entries(obj)) {
            map.set(key as K, value);
        }
        return map;
    }
}