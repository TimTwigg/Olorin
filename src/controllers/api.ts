import * as api from "@src/models/api_responses"

import { encounters } from "@src/temp/encounters"
import { conditions } from "@src/temp/conditions"
import { arasta } from "@src/temp/arasta"
import { aurelia } from "@src/temp/aurelia"
import { winter_ghoul } from "@src/temp/winter-ghoul"
import { StatBlockEntity } from "@src/models/statBlockEntity"
import { EntityOverview } from "@src/models/entity"

const entities = [
    new StatBlockEntity(arasta),
    new StatBlockEntity(aurelia),
    new StatBlockEntity(winter_ghoul)
]

const entityOverviews = [
    new EntityOverview(arasta.Name, arasta.Description.Type, arasta.Description.Size, arasta.ChallengeRating),
    new EntityOverview(aurelia.Name, aurelia.Description.Type, aurelia.Description.Size, aurelia.ChallengeRating),
    new EntityOverview(winter_ghoul.Name, winter_ghoul.Description.Type, winter_ghoul.Description.Size, winter_ghoul.ChallengeRating)
]

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

export async function getEntities(_user: string, _page: number, detailLevel: APIDetailLevel = 1): Promise<api.EntityResponse> {
    return {
        Entities: detailLevel === 1 ? entityOverviews : entities
    }
}

export async function getEntity(_user: string, entityName: string): Promise<api.SingleEntityResponse> {
    return {
        Entity: entities.find(e => e.Name === entityName)
    }
}