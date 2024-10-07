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