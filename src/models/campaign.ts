import { Player } from "@src/models/player";
import { dateFromString } from "@src/controllers/utils";

export type CampaignOverviewT = {
    Name: string;
    Description: string;
};

export class CampaignOverview implements CampaignOverviewT {
    Name: string;
    Description: string;
    CreationDate: Date;
    LastModified: Date;

    constructor(name: string, description: string, creationDate: Date, lastModified: Date) {
        this.Name = name;
        this.Description = description;
        this.CreationDate = creationDate;
        this.LastModified = lastModified;
    }
}

export class Campaign {
    Name: string;
    Description: string;
    CreationDate: Date;
    LastModified: Date;
    Players: Player[];

    constructor(name: string, description: string, players: Player[] = []) {
        this.Name = name;
        this.Description = description;
        this.Players = players;
        this.CreationDate = new Date();
        this.LastModified = new Date();
    }

    toOverview(): CampaignOverview {
        return new CampaignOverview(this.Name, this.Description, this.CreationDate, this.LastModified);
    }

    withUpdatedPlayer(player: Player): Campaign {
        const updatedPlayers = this.Players.map(p => p.RowID === player.RowID ? player : p);
        let c =  new Campaign(this.Name, this.Description, updatedPlayers);
        c.CreationDate = this.CreationDate;
        c.LastModified = new Date();
        return c;
    }

    public static loadFromJSON(json: any): Campaign {
        const players = json.Players ? json.Players.map((p: any) => Player.loadFromJSON(p)) : [];
        let c = new Campaign(json.Name, json.Description, players);
        c.CreationDate = dateFromString(json.CreationDate);
        c.LastModified = dateFromString(json.LastModified);
        return c;
    }
}