import * as api from "@src/models/api_responses";

import { EntityOverview } from "@src/models/entity";
import { Encounter, EncounterOverview } from "@src/models/encounter";
import { dateFromString } from "@src/controllers/utils";
import { deepCopy } from "@src/controllers/utils";
import { parseDataAsStatBlock } from "@src/models/statBlock";

export type APIDetailLevel = 1 | 2

/**
 * Base URL for the API server.
 */
const BASE_URL = "http://localhost:8080"

/**
 * Cache for API functions to avoid redundant calls.
 */
var FUNCTION_CACHE = new Map<string, any>()

/**
 * Excluded routes from caching.
 */
const CACHE_EXCLUDED_ROUTES = [
    "/encounter/all",
    "/encounter",
]

/**
 * Wrapper for API functions to handle caching
 * 
 * @param func function name to call
 * @param args arguments to pass to the function
 * 
 * @returns Promise<any> - the result of the function call
 */
async function api_wrapper(func: string, ...args: any): Promise<any> {
    let cache_key = func + JSON.stringify(args);
    if (FUNCTION_CACHE.has(cache_key) && !CACHE_EXCLUDED_ROUTES.some((route) => args[0] == (route))) {
        console.log("Cache hit for " + cache_key);
        return deepCopy(FUNCTION_CACHE.get(cache_key));
    }
    else {
        let data: any;
        if (func === "request") data = await _request(args[0], args[1]).then((data) => data);
        else if (func === "push") data = _push(args[0], args[1]).then((data) => data);
        else return null;
        FUNCTION_CACHE.set(cache_key, data);
        return data;
    }
}

/** 
 * [INTERNAL] Fetch data from the server using a GET request.
 * 
 * @param url The endpoint to fetch data from.
 * @param body The request parameters.
 * 
 * @returns The response data from the server.
 */
async function _request(url: string, body: any): Promise<any> {
    const response = await fetch(BASE_URL + url + "?" + new URLSearchParams({
        ...body,
    }).toString());

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
}

/** 
 * Fetch data from the server using a GET request.
 * 
 * @param url The endpoint to fetch data from.
 * @param body The request parameters.
 * 
 * @returns The response data from the server.
 */
async function request(url: string, body: any): Promise<any> {
    return api_wrapper("request", url, body).then((data) => data)
}

/**
 * [INTERNAL] Send data to the server using a POST request.
 * 
 * @param url The endpoint to send data to.
 * @param body The data to send in the request body.
 * 
 * @returns The response data from the server.
 */
async function _push(url: string, body: any): Promise<any> {
    const response = await fetch(BASE_URL + url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body, null, "\t"),
    });

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
    return api_wrapper("push", url, body).then((data) => data)
}

/**
 * Retrieve all encounters from the server.
 * 
 * @param _user The user ID.
 * 
 * @returns Promise<api.EncounterResponse> - A list of encounters.
 */
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

/**
 * Retrieve a single encounter from the server.
 * 
 * @param _user The user ID.
 * @param encounterID The ID of the encounter to retrieve.
 * 
 * @returns Promise<api.SingleEncounterResponse> - The encounter data.
 */
export async function getEncounter(_user: string, encounterID: number): Promise<api.SingleEncounterResponse> {
    return request("/encounter", {
        id: encounterID,
        detail_level: 2,
    }).then((data: any) => {
        return {
            Encounter: Encounter.loadFromJSON(data)
        }
    })
}

export async function getConditions(_user: string): Promise<api.ConditionResponse> {
    return request("/condition/all", {}).then((data: any) => {
        return {
            Conditions: data.map((condition: any) => {
                return condition.Name;
            })
        }
    })
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
    return request("/statblock/all", {
        page: _page,
        detail_level: detailLevel,
    }).then((data: any) => {
        return {
            Entities: data.map((entity: any) => {
                if (detailLevel == 1) return new EntityOverview(
                    entity.ID,
                    entity.Name,
                    entity.Type,
                    entity.Size,
                    entity.ChallengeRating,
                    entity.Source
                );
                else return parseDataAsStatBlock(entity);
            })
        }
    })
}

/**
 * Fetch a single stat block from the server.
 * @param _user The user ID.
 * @param entityID The id of the block to fetch.
 * 
 * @returns The statblock data.
 */
export async function getStatBlock(_user: string, entityID: number): Promise<api.SingleStatBlockResponse> {
    return request("/statblock", {
        id: entityID,
        detail_level: 2,
    }).then((data: any) => {
        return {
            StatBlock: parseDataAsStatBlock(data)
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
        return Encounter.loadFromJSON(data);
    });
}