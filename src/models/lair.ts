export class Lair {
    Name: string;
    OwningEntityDBID: number;
    Description: string;
    Initiative: number;
    Actions?: {
        Description: string;
        Items: {
            Name: string;
            Description: string;
        }[];
    };
    RegionalEffects?: {
        Description: string;
        Items: {
            Name: string;
            Description: string;
        }[];
    };

    constructor(name: string, OwningEntityDBID: number, description: string, initiative: number, actions?: { Description: string, Items: {Name: string, Description: string}[] }, regionalEffects?: { Description: string, Items: {Name: string, Description: string}[] }) {
        this.Name = name;
        this.OwningEntityDBID = OwningEntityDBID;
        this.Description = description;
        this.Initiative = initiative;
        this.Actions = actions;
        this.RegionalEffects = regionalEffects;
    }

    public static loadFromJSON(json: any): Lair {
        return json as Lair;
    }
}

export function isLair(arg: object): arg is Lair {
    return (arg.hasOwnProperty("Name") && arg.hasOwnProperty("Description") && arg.hasOwnProperty("Initiative")) && !arg.hasOwnProperty("EntityType");
}