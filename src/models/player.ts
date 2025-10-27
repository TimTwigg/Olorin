import { StatBlock, parseDataAsStatBlock } from "@src/models/statBlock";

export type PlayerJSON = {
    Campaign: string;
    StatBlock: unknown;
    Notes: string;
    RowID: number;
};

export class Player {
    Campaign: string;
    StatBlock: StatBlock;
    Notes: string;
    RowID: number;

    constructor(campaign: string, statBlock: StatBlock, notes: string, rowID: number) {
        this.Campaign = campaign;
        this.StatBlock = statBlock;
        this.Notes = notes;
        this.RowID = rowID;
    }

    public static loadFromJSON(json: PlayerJSON): Player {
        const statBlock = parseDataAsStatBlock(json.StatBlock);
        return new Player(json.Campaign, statBlock, json.Notes, json.RowID);
    }
}
