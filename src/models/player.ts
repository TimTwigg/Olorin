import { StatBlock, parseDataAsStatBlock } from "@src/models/statBlock";

export class Player {
    Campaign: string;
    StatBlock:  StatBlock;
    Notes: string;
    RowID: number;

    constructor(campaign: string, statBlock: StatBlock, notes: string, rowID: number) {
        this.Campaign = campaign;
        this.StatBlock = statBlock;
        this.Notes = notes;
        this.RowID = rowID;
    }

    public static loadFromJSON(json: any): Player {
        const statBlock = parseDataAsStatBlock(json.StatBlock);
        return new Player(json.Campaign, statBlock, json.Notes, json.RowID);
    }
}