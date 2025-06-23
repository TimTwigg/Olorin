import { Player } from "@src/models/player";

export type CampaignOverviewT = {
    Name: string;
    Description: string;
};

export class CampaignOverview implements CampaignOverviewT {
    Name: string;
    Description: string;

    constructor(name: string, description: string) {
        this.Name = name;
        this.Description = description;
    }
}

export class Campaign {
    Name: string;
    Description: string;
    Players: Player[];

    constructor(name: string, description: string, players: Player[]) {
        this.Name = name;
        this.Description = description;
        this.Players = players;
    }

    toOverview(): CampaignOverview {
        return new CampaignOverview(this.Name, this.Description);
    }

    public static loadFromJSON(json: any): Campaign {
        const players = json.Players ? json.Players.map((p: any) => Player.loadFromJSON(p)) : [];
        return new Campaign(json.Name, json.Description, players);
    }
}