export class SmartMap<keyType, valueType> extends Map {
    dGet(key: keyType, defaultValue: valueType): any {
        return super.get(key) || defaultValue;
    }
}