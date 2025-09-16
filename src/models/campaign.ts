import { Player } from "@src/models/player";
import { dateFromString, newLocalDate } from "@src/controllers/utils";

export type CampaignOverviewT = {
    id: number;
    Name: string;
    Description: string;
};

export class CampaignOverview implements CampaignOverviewT {
    id: number;
    Name: string;
    Description: string;
    CreationDate: Date;
    LastModified: Date;

    constructor(id: number, name: string, description: string, creationDate: Date, lastModified: Date) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.CreationDate = creationDate;
        this.LastModified = lastModified;
    }
}

export class Campaign {
    id: number;
    Name: string;
    Description: string;
    CreationDate: Date;
    LastModified: Date;
    Players: Player[];

    constructor(id: number, name: string, description: string, players: Player[] = []) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.Players = players;
        this.CreationDate = newLocalDate();
        this.LastModified = newLocalDate();
    }

    toOverview(): CampaignOverview {
        return new CampaignOverview(this.id, this.Name, this.Description, this.CreationDate, this.LastModified);
    }

    withUpdatedPlayer(player: Player): Campaign {
        const updatedPlayers = this.Players.map(p => p.RowID === player.RowID ? player : p);
        let c =  new Campaign(this.id, this.Name, this.Description, updatedPlayers);
        c.CreationDate = this.CreationDate;
        c.LastModified = newLocalDate();
        return c;
    }

    public static loadFromJSON(json: any): Campaign {
        const players = json.Players ? json.Players.map((p: any) => Player.loadFromJSON(p)) : [];
        let c = new Campaign(json.id, json.Name, json.Description, players);
        c.CreationDate = dateFromString(json.CreationDate);
        c.LastModified = dateFromString(json.LastModified);
        return c;
    }
}