import { SmartMap } from "@src/models/smartMap"
import { StatBlock } from "@src/models/statBlock"

export interface Entity {
    Name: string
    Initiative: number
    CurrentHitPoints: number
    Conditions: SmartMap<string, number>
    SpellSlots: SmartMap<number, { total: number, used: number }>
    Concentration: boolean
    Reactions: { total: number, used: number }
    Notes: string
    StatBlock: StatBlock;
    IsHostile: boolean
    EncounterLocked: boolean

    tick(): void
    randomizeInitiative(): void
    setInitiative(value: number): void
    updateHP(amount: number): void
    addCondition(condition: string): void
    removeCondition(condition: string): void
    addSpellSlot(level: number): void
    removeSpellSlot(level: number): void
    useSpellSlot(level: number): void
    resetSpellSlots(): void
    setConcentration(value: boolean): void
    useReaction(): void
    resetReactions(): void
    resetAll(): void
    setHostile(value: boolean): void
    setLock(value: boolean): void
}