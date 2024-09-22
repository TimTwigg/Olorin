import { Entity } from "@src/models/entity"
import { SmartMap } from "@src/models/smartMap";
import { StatBlock } from "@src/models/statBlock"
import { d20, modifierOf } from "@src/controllers/utils";

export class StatBlockEntity implements Entity {
    Name;
    Initiative;
    CurrentHitPoints;
    Conditions = new SmartMap<string, number>();
    SpellSlots = new SmartMap<number, { total: number, used: number }>();
    Concentration = false;
    Reactions;
    Notes = "";
    StatBlock: StatBlock;
    IsHostile: boolean;
    EncounterLocked: boolean = false;

    constructor(statBlock: StatBlock, initiative: number, IsHostile: boolean = true) {
        this.Name = statBlock.Name;
        this.StatBlock = statBlock;
        this.Initiative = initiative;
        this.Reactions = { total: statBlock.Stats.ReactionCount, used: 0 };
        this.IsHostile = IsHostile;
        this.CurrentHitPoints = statBlock.Stats.HitPoints.Average;
    }

    tick(): void {
        for (let cond of this.Conditions.keys()) {
            this.Conditions.set(cond, this.Conditions.dGet(cond, 0) + 1);
        }
    }

    randomizeInitiative(): void {
        this.Initiative = d20() + modifierOf(this.StatBlock.Stats.Dexterity);
    }

    setInitiative(value: number): void {
        this.Initiative = value;
    }

    updateHP(amount: number): void {
        this.CurrentHitPoints = Math.min(this.CurrentHitPoints + amount, this.StatBlock.Stats.HitPoints.Average);
        if (this.CurrentHitPoints < 0) this.CurrentHitPoints = 0;
    }

    addCondition(condition: string): void {
        if (!this.Conditions.has(condition)) {
            this.Conditions.set(condition, 1);
        }
    }

    removeCondition(condition: string): void {
        this.Conditions.delete(condition);
    }

    addSpellSlot(level: number): void {
        let slot = this.SpellSlots.dGet(level, { total: 0, used: 0 });
        slot.total++;
        this.SpellSlots.set(level, slot);
    }

    removeSpellSlot(level: number): void {
        let slot = this.SpellSlots.dGet(level, { total: 0, used: 0 });
        if (slot.total <= 0) throw new Error("No Spell Slots of that level");
        slot.total--;
        if (slot.used > slot.total) slot.used = slot.total;
        this.SpellSlots.set(level, slot);
    }

    useSpellSlot(level: number): void {
        let slot = this.SpellSlots.dGet(level, { total: 0, used: 0 });
        if (slot.used >= slot.total) throw new Error("No More Spell Slots of that level");
        slot.used++;
        this.SpellSlots.set(level, slot);
    }

    resetSpellSlots(): void {
        this.SpellSlots.forEach((slot, level) => {
            this.SpellSlots.set(level, { total: slot.total, used: 0 });
        });
    }

    setConcentration(value: boolean): void {
        this.Concentration = value;
    }

    useReaction(): void {
        if (this.Reactions.used >= this.Reactions.total) throw new Error("No More Reactions");
        this.Reactions.used++;
    }

    resetReactions(): void {
        this.Reactions.used = 0;
    }

    resetAll(): void {
        this.resetSpellSlots();
        this.resetReactions();
        this.Conditions.clear();
        this.Concentration = false;
    }

    setHostile(value: boolean): void {
        this.IsHostile = value;
    }

    setLock(value: boolean): void {
        this.EncounterLocked = value;
    }
}