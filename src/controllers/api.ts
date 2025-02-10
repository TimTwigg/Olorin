import * as api from "@src/models/api_responses";

import { encounters } from "@src/temp/encounters";
import { conditions } from "@src/temp/conditions";
import { arasta } from "@src/temp/arasta";
import { aurelia } from "@src/temp/aurelia";
import { winter_ghoul } from "@src/temp/winter-ghoul";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { EntityOverview } from "@src/models/entity";
import { StatBlock } from "@src/models/statBlock";
import { Encounter } from "@src/models/encounter";

const entities = new Map<string, StatBlock>()
entities.set(arasta.Name, arasta)
entities.set(aurelia.Name, aurelia)
entities.set(winter_ghoul.Name, winter_ghoul)

const entityOverviews = [
    new EntityOverview(arasta.Name, arasta.Description.Type, arasta.Description.Size, arasta.ChallengeRating, arasta.Source),
    new EntityOverview(aurelia.Name, aurelia.Description.Type, aurelia.Description.Size, aurelia.ChallengeRating, aurelia.Source),
    new EntityOverview(winter_ghoul.Name, winter_ghoul.Description.Type, winter_ghoul.Description.Size, winter_ghoul.ChallengeRating, winter_ghoul.Source)
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
        Entities: detailLevel === 1 ? entityOverviews : Array.from(entities.values()).map((e) => new StatBlockEntity(e))
    }
}

export async function getEntity(_user: string, entityName: string): Promise<api.SingleEntityResponse> {
    if (entities.has(entityName)) {
        let e = new StatBlockEntity(entities.get(entityName)!);
        return {
            Entity: e
        }
    }
    throw new Error("Entity not found")
}

/**
 * Save an encounter to the server.
 * @param _user The user ID.
 * @param encounter The encounter to save.
 * 
 * @returns A boolean indicating whether the save was successful.
 */
export async function saveEncounter(_user: string, encounter: Encounter): Promise<boolean> {
    console.log("Saved Encounter: " + encounter.Name);
    return true;
}