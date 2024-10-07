import * as api from "@src/models/api_responses"

import { encounters } from "@src/temp/encounters"
import { conditions } from "@src/temp/conditions"
import { arasta } from "@src/temp/arasta"
import { aurelia } from "@src/temp/aurelia"
import { winter_ghoul } from "@src/temp/winter-ghoul"
import { StatBlockEntity } from "@src/models/statBlockEntity"

export type APIDetailLevel = 1 | 2

export async function getEncounters(_user: string): Promise<api.EncounterResponse> {
    return {
        Encounters: encounters
    }
}

export async function getConditions(_user: string): Promise<api.ConditionResponse> {
    return {
        Conditions: conditions
    }
}

export async function getEntities(_user: string, detailLevel: APIDetailLevel = 1): Promise<api.EntityResponse> {
    if (detailLevel === 1) return {
        Entities: [
            arasta.Name,
            aurelia.Name,
            winter_ghoul.Name
        ]
    }
    return {
        Entities: [
            new StatBlockEntity(arasta),
            new StatBlockEntity(aurelia),
            new StatBlockEntity(winter_ghoul)
        ]
    }
}