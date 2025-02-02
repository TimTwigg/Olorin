export class Lair {
    Name: string;
    Description: string;
    Initiative: number;
    Actions?: {
        Description: string;
        Items: string[];
    };
    RegionalEffects?: {
        Description: string;
        Items: string[];
    };

    constructor(name: string, description: string, initiative: number, actions?: { Description: string, Items: string[] }, regionalEffects?: { Description: string, Items: string[] }) {
        this.Name = name;
        this.Description = description;
        this.Initiative = initiative;
        this.Actions = actions;
        this.RegionalEffects = regionalEffects;
    }
}

export function isLair(arg: object): arg is Lair {
    return (arg.hasOwnProperty("Name") && arg.hasOwnProperty("Description") && arg.hasOwnProperty("Initiative")) && !arg.hasOwnProperty("EntityType");
}