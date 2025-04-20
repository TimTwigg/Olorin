import { Encounter, EncounterOverview } from "@src/models/encounter"

export type EncounterResponse = {
    Encounters: Encounter[]|EncounterOverview[]
}

export type SingleEncounterResponse = {
    Encounter: Encounter|undefined
}