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
}