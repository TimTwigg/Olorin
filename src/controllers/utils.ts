export function d20(): number {
    return Math.ceil(Math.random() * 20);
}

export function modifierOf(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function hashCode(str: string): number {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

export function deepCopy<T>(obj: T): T {
    var copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function dateFromString(dateString: string): Date {
    let year = parseInt(dateString.substring(0, 4));
    let month = parseInt(dateString.substring(5, 7)) - 1;
    let day = parseInt(dateString.substring(8, 10));
    return new Date(year, month, day);
}

export function newLocalDate(): Date {
    return new Date(Date.now() - new Date().getTimezoneOffset()*60000);
}