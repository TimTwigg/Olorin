import { EncounterResponse } from "@src/models/api_responses/encounterResponse"

import { encounters } from "@src/temp/encounters"

export async function getEncounters(_user: string): Promise<EncounterResponse> {
    return {
        Encounters: encounters
    }
}