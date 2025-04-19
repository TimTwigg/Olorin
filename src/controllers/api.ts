import * as api from "@src/models/api_responses";

import { encounters } from "@src/temp/encounters";
import { conditions } from "@src/temp/conditions";
import { arasta } from "@src/temp/arasta";
import { aurelia } from "@src/temp/aurelia";
import { winter_ghoul } from "@src/temp/winter-ghoul";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { EntityOverview } from "@src/models/entity";
import { StatBlock, parseDataAsStatBlock } from "@src/models/statBlock";
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

const BASE_URL = "http://localhost:8080"

/** 
 * Fetch data from the server using a GET request.
 * 
 * @param url The endpoint to fetch data from.
 * @param body The request parameters.
 * 
 * @returns The response data from the server.
 */
async function request(url: string, body: any): Promise<any> {
    const response = await fetch(BASE_URL + url + "?" + new URLSearchParams({
        ...body,
    }).toString());

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Send data to the server using a POST request.
 * 
 * @param url The endpoint to send data to.
 * @param body The data to send in the request body.
 * 
 * @returns The response data from the server.
 */
async function push(url: string, body: any): Promise<number> {
    const response = await fetch(BASE_URL + url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.status;
}

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

/**
 * Fetch all entities from the server, within a given page.
 * @param _user The user ID.
 * @param _page The page number for pagination.
 * @param detailLevel The detail level for the entity data.
 * 
 * @returns A list of entities.
 */
export async function getEntities(_user: string, _page: number, detailLevel: APIDetailLevel = 1): Promise<api.EntityResponse> {
    return {
        Entities: detailLevel === 1 ? entityOverviews : Array.from(entities.values()).map((e) => new StatBlockEntity(e))
    }
}

/**
 * Fetch a single entity from the server.
 * @param _user The user ID.
 * @param entityName The name of the entity to fetch.
 * 
 * @returns The entity data.
 */
export async function getEntity(_user: string, entityName: string): Promise<api.SingleEntityResponse> {
    return request("/statblock", {
        name: entityName,
        detail_level: 2,
    }).then((data: any) => {
        return {
            Entity: new StatBlockEntity(parseDataAsStatBlock(data))
        }
    })
}

/**
 * Save an encounter to the server.
 * @param _user The user ID.
 * @param encounter The encounter to save.
 * 
 * @returns A boolean indicating whether the save was successful.
 */
export async function saveEncounter(_user: string, encounter: Encounter): Promise<boolean> {
    if (!encounter) {
        throw new Error("Encounter is null or undefined.");
    }
    return push("/encounter", encounter).then((status: number) => {
        return status === 200;
    });
}