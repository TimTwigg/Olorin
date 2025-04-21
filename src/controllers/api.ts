import * as api from "@src/models/api_responses";

import { conditions } from "@src/temp/conditions";
import { arasta } from "@src/temp/arasta";
import { aurelia } from "@src/temp/aurelia";
import { winter_ghoul } from "@src/temp/winter-ghoul";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { EntityOverview } from "@src/models/entity";
import { StatBlock, parseDataAsStatBlock } from "@src/models/statBlock";
import { Encounter, EncounterOverview } from "@src/models/encounter";
import { dateFromString } from "@src/controllers/utils";

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
async function push(url: string, body: any): Promise<any> {
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

    return response.json();
}

export async function getEncounters(_user: string): Promise<api.EncounterResponse> {
    return request("/encounter/all", {}).then((data: any) => {
        return {
            Encounters: data.map((encounter: any) => {
                return new EncounterOverview(
                    encounter.ID,
                    encounter.Name,
                    encounter.Description,
                    {
                        CreationDate: dateFromString(encounter.Metadata.CreationDate),
                        AccessedDate: dateFromString(encounter.Metadata.AccessedDate),
                        Campaign: encounter.Metadata.Campaign,
                        Started: encounter.Metadata.Started,
                        Round: encounter.Metadata.Round,
                        Turn: encounter.Metadata.Turn,
                    }
                )
            })
        }
    })
}

export async function getEncounter(_user: string, encounterID: number): Promise<api.SingleEncounterResponse> {
    // return request("/encounter", {
    //     id: encounterID,
    //     detailLevel: 2,
    // }).then((data: any) => {
    //     return {
    //         Encounter: new Encounter(
    //             encounterID,
    //             data.Name,
    //             data.Description,
    //             {
    //                 CreationDate: dateFromString(data.Metadata.CreationDate),
    //                 AccessedDate: dateFromString(data.Metadata.AccessedDate),
    //                 Campaign: data.Metadata.Campaign,
    //                 Started: data.Metadata.Started,
    //                 Round: data.Metadata.Round,
    //                 Turn: data.Metadata.Turn,
    //             }
    //         )
    //     }
    // })
    return null as any;
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
 * @returns The saved encounter data.
 */
export async function saveEncounter(_user: string, encounter: Encounter): Promise<Encounter> {
    if (!encounter) {
        throw new Error("Encounter is null or undefined.");
    }
    return push("/encounter", encounter).then((data: any) => {
        return data as Encounter;
    });
}