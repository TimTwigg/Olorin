import { StatBlock, parseDataAsStatBlock } from "@src/models/statBlock";

export class Player {
    StatBlock:  StatBlock;
    Notes: string;

    constructor(statBlock: StatBlock, notes: string) {
        this.StatBlock = statBlock;
        this.Notes = notes;
    }

    public static loadFromJSON(json: any): Player {
        const statBlock = parseDataAsStatBlock(json.StatBlock);
        return new Player(statBlock, json.Notes);
    }
}