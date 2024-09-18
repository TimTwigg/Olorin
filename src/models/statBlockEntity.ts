import { Entity } from "@src/models/entity"
import { SmartMap } from "@src/models/smartMap";
import { StatBlock } from "@src/models/statBlock"
import { d20, modifierOf } from "@src/controllers/utils";

export class StatBlockEntity implements Entity {
    Name = "";
    Initiative;
    CurrentHitPoints = 0;
    Conditions = new SmartMap<string, number>();
    SpellSlots = new SmartMap<number, { total: number, used: number }>();
    Concentration = false;
    Reactions = 1;
    Notes = "";
    StatBlock: StatBlock;

    constructor(statBlock: StatBlock, initiative: number) {
        this.StatBlock = statBlock;
        this.Initiative = initiative;
    }

    tick(): void {
        for (let cond of this.Conditions.keys()) {
            this.Conditions.set(cond, this.Conditions.dGet(cond, 0) + 1);
        }
    }

    randomizeInitiative(): void {
        this.Initiative = d20() + modifierOf(this.StatBlock.Stats.Dexterity);
    }
}