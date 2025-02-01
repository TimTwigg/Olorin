export class Lair {
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

    constructor(description: string, initiative: number, actions?: { Description: string, Items: string[] }, regionalEffects?: { Description: string, Items: string[] }) {
        this.Description = description;
        this.Initiative = initiative;
        this.Actions = actions;
        this.RegionalEffects = regionalEffects;
    }
}