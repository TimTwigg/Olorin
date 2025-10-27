import { SmartMap } from "./smartMap";

export class CounterMap<keyType> extends SmartMap<keyType, number> {
    increment(key: keyType): void {
        this.set(key, this.dGet(key, 0) + 1);
    }

    decrement(key: keyType): void {
        this.set(key, this.dGet(key, 0) - 1);
    }
}
