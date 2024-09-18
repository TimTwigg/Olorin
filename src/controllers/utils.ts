export function d20(): number {
    return Math.ceil(Math.random() * 20);
}

export function modifierOf(score: number): number {
    return Math.floor((score - 10) / 2);
}