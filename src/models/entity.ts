import { SmartMap } from "./smartMap"

export interface Entity {
    Name: string
    Initiative: number
    CurrentHitPoints: number
    Conditions: SmartMap<string, number>
    SpellSlots: SmartMap<number, { total: number, used: number }>
    Concentration: boolean
    Reactions: number
    Notes: string

    tick(): void
    randomizeInitiative(): void
}