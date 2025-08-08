import * as api from "@src/models/api_responses";
import { EntityOverview } from "@src/models/entity";
import { Encounter, EncounterOverview } from "@src/models/encounter";
import { dateFromString } from "@src/controllers/utils";
import { parseDataAsStatBlock } from "@src/models/statBlock";
import * as caching from "@src/controllers/api_cache";
import { SmartMap } from "@src/models/data_structures/smartMap";
import { Campaign, CampaignOverview } from "@src/models/campaign";
import { Player } from "@src/models/player"

export type APIDetailLevel = 1 | 2

/**
 * Base URL for the API server.
 */
const BASE_URL = "http://localhost:8080"

/**
 * Wrapper for API functions to handle caching
 * 
 * @param func function name to call
 * @param args arguments to pass to the function
 * 
 * @returns Promise<any> - the result of the function call
 */
async function api_wrapper(func: string, ...args: any): Promise<any> {
    let cached_entry = caching.checkCache(caching.createCacheKey(func, args));
    if (cached_entry !== null) {
        return cached_entry.data;
    }
    else {
        let data: any;
        if (func === "request") data = await _request(args[0], args[1]).then((data) => data);
        else if (func === "push") data = _push(args[0], args[1]).then((data) => data);
        else if (func === "delete") data = _delete(args[0], args[1]).then((data) => data);
        else return null;
        caching.setCacheEntry(caching.createCacheKey(func, args), data);
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
    }).toString(), {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
    });

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
 * [INTERNAL] Delete data from the server using a DELETE request.
 * 
 * @param url The endpoint to delete data from.
 * @param body The data to send in the request body.
 * 
 * @returns The response data from the server.
 */
async function _delete(url: string, body: any): Promise<any> {
    const response = await fetch(BASE_URL + url + "/" + body.id, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: null,
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return true;
}

/**
 * Delete data from the server using a DELETE request.
 * 
 * @param url The endpoint to delete data from.
 * @param body The data to send in the request body.
 * 
 * @returns The response data from the server.
 */
export async function deleteRequest(url: string, body: { id: any }): Promise<any> {
    return api_wrapper("delete", url, body).then((data) => data)
}

/**
 * Retrieve all encounters from the server.
 * 
 * @returns Promise<api.EncounterResponse> - A list of encounters.
 */
export async function getEncounters(): Promise<api.EncounterResponse> {
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
 * @param encounterID The ID of the encounter to retrieve.
 * 
 * @returns Promise<api.SingleEncounterResponse> - The encounter data.
 */
export async function getEncounter(encounterID: number): Promise<api.SingleEncounterResponse> {
    return request("/encounter", {
        id: encounterID.toString(),
        detail_level: 2,
    }).then((data: any) => {
        return {
            Encounter: Encounter.loadFromJSON(data)
        }
    })
}

/**
 * Retrieve all conditions from the server.
 * 
 * @returns A list of conditions.
 */
export async function getConditions(): Promise<api.ConditionResponse> {
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
 * 
 * @param _page The page number for pagination.
 * @param detailLevel The detail level for the entity data.
 * 
 * @returns A list of entities.
 */
export async function getEntities(_page: number, detailLevel: APIDetailLevel = 1): Promise<api.EntityResponse> {
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
 * 
 * @param entityID The id of the block to fetch.
 * 
 * @returns The statblock data.
 */
export async function getStatBlock(entityID: number): Promise<api.SingleStatBlockResponse> {
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
 * 
 * @param encounter The encounter to save.
 * 
 * @returns The saved encounter data.
 */
export async function saveEncounter(encounter: Encounter): Promise<Encounter> {
    if (!encounter) {
        throw new Error("Encounter is null or undefined.");
    }
    return push("/encounter", encounter).then((data: any) => {
        return Encounter.loadFromJSON(data);
    });
}

/**
 * Delete an encounter from the server.
 * 
 * @param encounterID The ID of the encounter to delete.
 * 
 * @returns A boolean indicating success or failure.
 */
export async function deleteEncounter(encounterID: number): Promise<boolean> {
    return deleteRequest("/encounter", {
        id: encounterID,
    }).then(() => { return true }, () => { return false });
}

/**
 * Fetch user metadata from the server.
 * 
 * @returns The metadata
 */
export async function getMetadata(): Promise<api.MetadataResponse> {
    return request("/metadata", {}).then((data: object) => {
        return {
            Metadata: new SmartMap<string, string>(Object.entries(data))
        }
    });
}

/**
 * Set user metadata on the server.
 * 
 * @param metadata The new metadata to set.
 * 
 * @returns A boolean indicating success or failure.
 */
export async function setMetadata(metadata: Map<string, string>): Promise<api.MetadataResponse> {
    return push("/metadata", Object.fromEntries(metadata)).then((data) => {
        return {
            Metadata: new SmartMap<string, string>(Object.entries(data))
        }
    });
}

/**
 * Get the display name of the user.
 *
 * @returns The display name or null if not set.
 */
export async function getDisplayName(): Promise<string | null> {
    return getMetadata().then((data) => {
        let name = data.Metadata.dGet("displayName", data.Metadata.dGet("email", ""));
        if (name && name.length > 0) {
            return name;
        }
        return null;
    });
}

/**
 * Send a support request to the server.
 *
 * @param description The description of the support request.
 *
 * @returns A boolean indicating success or failure.
 */
export async function sendSupportRequest(description: string): Promise<boolean> {
    if (!description || description.trim().length === 0) {
        throw new Error("Description cannot be empty.");
    }
    return push("/support", { description }).then(() => true, () => false);
}

/**
 * Fetch all campaigns from the server.
 *
 * @param detailLevel  The detail level for the campaign data (1 for overview, 2 for full details).
 * 
 * @returns A list of campaigns.
 */
export async function getCampaigns(detailLevel: APIDetailLevel = 1): Promise<api.CampaignResponse> {
    return request("/campaign/all", {
        detail_level: detailLevel,
    }).then((data: any) => {
        return {
            Campaigns: data.map((c: any) => {
                if (detailLevel === 1) {
                    return new CampaignOverview(c.Name, c.Description, dateFromString(c.CreationDate), dateFromString(c.LastModified));
                }
                else {
                    return Campaign.loadFromJSON(c);
                }
            }),
        }
    });
}

/**
 * Fetch a single campaign from the server.
 *
 * @param campaignName The name of the campaign to fetch.
 *
 * @returns The campaign data.
 */
export async function getCampaign(campaignName: string): Promise<api.SingleCampaignResponse> {
    return request("/campaign", {
        name: campaignName,
        detail_level: 2,
    }).then((data: any) => {
        return {
            Campaign: Campaign.loadFromJSON(data)
        }
    });
}

/**
 * Save a campaign to the server.
 *
 * @param campaign The campaign to save.
 *
 * @returns The saved campaign data.
 */
export async function saveCampaign(campaign: Campaign): Promise<Campaign> {
    if (!campaign) {
        throw new Error("Campaign is null or undefined.");
    }
    return push("/campaign", campaign).then((data: any) => {
        return Campaign.loadFromJSON(data);
    });
}

/**
 * Delete a campaign from the server.
 *
 * @param campaignName The name of the campaign to delete.
 *
 * @returns A boolean indicating success or failure.
 */
export async function deleteCampaign(campaignName: string): Promise<boolean> {
    return deleteRequest("/campaign", {
        id: campaignName,
    }).then(() => { return true }, () => { return false });
}

/**
 * Create a new campaign on the server.
 *
 * @param campaign The campaign to create.
 *
 * @returns The created campaign data.
 */
export async function createCampaign(campaign: Campaign): Promise<Campaign> {
    if (!campaign) {
        throw new Error("Campaign is null or undefined.");
    }
    return push("/campaign", campaign).then((data: any) => {
        return Campaign.loadFromJSON(data);
    });
}

/**
 * Edit a player on the server.
 *
 * @param player The player to edit.
 * 
 * @returns The edited player data.
 */
export async function editPlayer(player: Player): Promise<Player> {
    if (!player) {
        throw new Error("Player is null or undefined.");
    }
    return push("/player", player).then((data: any) => {
        return Player.loadFromJSON(data);
    });
}

/**
 * Delete a player from the server.
 *
 * @param player The player to delete.
 * 
 * @returns A boolean indicating success or failure.
 */
export async function deletePlayer(player: Player): Promise<boolean> {
    return deleteRequest("/player", {
        id: `${player.Campaign},${player.RowID}`,
    }).then(() => { return true }, () => { return false });
}

/**
 * Retrieve all types from the server.
 *
 * @returns A list of types.
 */
export async function getTypes(): Promise<api.TypeResponse> {
    return request("/type/all", {}).then((data: any) => {
        return {
            Types: data
        }
    })
}