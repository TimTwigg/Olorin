export class Condition {
    Name: string;
    Effects: string[];

    constructor(name: string, effects: string[]) {
        this.Name = name;
        this.Effects = effects;
    }
}
