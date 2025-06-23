import { StatBlock } from "@src/models/statBlock";

export type StatBlockResponse = {
    StatBlocks: StatBlock[]
}

export type SingleStatBlockResponse = {
    StatBlock: StatBlock | undefined
}