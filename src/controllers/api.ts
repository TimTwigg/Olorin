import * as api from "@src/models/api_responses";
import { EntityOverview, EntityOverviewT } from "@src/models/entity";
import { Encounter, EncounterOverview, EncounterOverviewJSON, EncounterJSON } from "@src/models/encounter";
import { dateFromString } from "@src/controllers/utils";
import { parseDataAsStatBlock, StatBlockJSON } from "@src/models/statBlock";
import * as caching from "@src/controllers/api_cache";
import { SmartMap } from "@src/models/data_structures/smartMap";
import { Campaign, CampaignOverview, CampaignJSON, CampaignOverviewJSON } from "@src/models/campaign";
import { Player, PlayerJSON } from "@src/models/player";
import { Condition } from "@src/models/condition";

export type APIDetailLevel = 1 | 2;

/**
 * Base URL for the API server.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Wrapper for API functions to handle caching
 *
 * @param func function name to call
 * @param url endpoint URL
 * @param args arguments to pass to the function
 *
 * @returns Promise<unknown> - the result of the function call
 */
async function api_wrapper(func: string, url: string, args: Record<string, unknown>): Promise<unknown> {
    if (caching.isCacheableFunction(func) && caching.isCacheableRoute(url)) {
        const cached_entry = caching.checkCache(caching.createCacheKey(func, args));
        if (cached_entry !== null) {
            return cached_entry.data;
        }
    }
    let data: unknown;
    if (func === "request") data = await _request(url, args as Record<string, string>).then((data) => data);
    else if (func === "push") data = _push(url, args).then((data) => data);
    else if (func === "delete") data = _delete(url, (args as { id: string }).id).then((data) => data);
    else return null;
    if (caching.isCacheableFunction(func) && caching.isCacheableRoute(url)) {
        caching.setCacheEntry(caching.createCacheKey(func, args), data);
    }
    return data;
}

/**
 * [INTERNAL] Fetch data from the server using a GET request.
 *
 * @param url The endpoint to fetch data from.
 * @param body The request parameters.
 *
 * @returns The response data from the server.
 */
async function _request(url: string, body: Record<string, string>): Promise<unknown> {
    const response = await fetch(
        BASE_URL +
            url +
            "?" +
            new URLSearchParams({
                ...body,
            }).toString(),
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(response.statusText);
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
async function request(url: string, body: Record<string, string>): Promise<unknown> {
    return api_wrapper("request", url, body).then((data) => data);
}

/**
 * [INTERNAL] Send data to the server using a POST request.
 *
 * @param url The endpoint to send data to.
 * @param body The data to send in the request body.
 *
 * @returns The response data from the server.
 */
async function _push(url: string, body: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(BASE_URL + url, {
        method: "POST",
        headers: {
            Accept: "application/json",
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
async function push(url: string, body: unknown): Promise<unknown> {
    return api_wrapper("push", url, body as Record<string, unknown>).then((data) => data);
}

/**
 * [INTERNAL] Delete data from the server using a DELETE request.
 *
 * @param url The endpoint to delete data from.
 * @param id The ID of the resource to delete.
 *
 * @returns The response data from the server.
 */
async function _delete(url: string, id: string): Promise<unknown> {
    const response = await fetch(BASE_URL + url + "/" + id, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
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
 * @param id The ID of the resource to delete.
 *
 * @returns The response data from the server.
 */
export async function deleteRequest(url: string, id: string): Promise<unknown> {
    return api_wrapper("delete", url, { id: id }).then((data) => data);
}

/**
 * Retrieve all encounters from the server.
 *
 * @returns Promise<api.EncounterResponse> - A list of encounters.
 */
export async function getEncounters(): Promise<api.EncounterResponse> {
    return request("/encounter/all", {}).then((data: unknown) => {
        return {
            Encounters: (data as EncounterOverviewJSON[]).map((encounter) => {
                return new EncounterOverview(encounter.id, encounter.Name, encounter.Description, {
                    CreationDate: dateFromString(encounter.Metadata.CreationDate),
                    AccessedDate: dateFromString(encounter.Metadata.AccessedDate),
                    CampaignID: encounter.Metadata.CampaignID,
                    Started: encounter.Metadata.Started,
                    Round: encounter.Metadata.Round,
                    Turn: encounter.Metadata.Turn,
                });
            }),
        };
    });
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
        detail_level: "2",
    }).then((data) => {
        return {
            Encounter: Encounter.loadFromJSON(data as EncounterJSON),
        };
    });
}

/**
 * Retrieve all conditions from the server.
 *
 * @returns A list of conditions.
 */
export async function getConditions(): Promise<api.ConditionResponse> {
    return request("/condition/all", {}).then((data: unknown) => {
        return {
            Conditions: (data as Condition[]).map((condition) => {
                return condition;
            }),
        };
    });
}

/**
 * Fetch all entities from the server, within a given page.
 *
 * @param _page The page number for pagination.
 *
 * @returns A list of entities.
 */
export async function getEntities(_page: number): Promise<api.EntityResponse> {
    return request("/statblock/all", {
        page: _page.toString(),
    }).then((data) => {
        return {
            Entities: (data as EntityOverviewT[]).map((entity) => {
                return new EntityOverview(entity.ID, entity.Name, entity.Type, entity.Size, entity.ChallengeRating, entity.Source);
            }),
        };
    });
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
        id: entityID.toString(),
        detail_level: "2",
    }).then((data) => {
        return {
            StatBlock: parseDataAsStatBlock(data as StatBlockJSON),
        };
    });
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
    return push("/encounter", encounter).then((data) => {
        return Encounter.loadFromJSON(data as EncounterJSON);
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
    return deleteRequest("/encounter", encounterID.toString()).then(
        () => {
            return true;
        },
        () => {
            return false;
        }
    );
}

/**
 * Fetch user metadata from the server.
 *
 * @returns The metadata
 */
export async function getMetadata(): Promise<api.MetadataResponse> {
    return request("/metadata", {}).then((data) => {
        return {
            Metadata: new SmartMap<string, string>(Object.entries(data as object)),
        };
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
            Metadata: new SmartMap<string, string>(Object.entries(data as object)),
        };
    });
}

/**
 * Get the display name of the user.
 *
 * @returns The display name or null if not set.
 */
export async function getDisplayName(): Promise<string | null> {
    return getMetadata().then((data) => {
        const name = data.Metadata.dGet("displayName", data.Metadata.dGet("email", ""));
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
    return push("/support", { description }).then(
        () => true,
        () => false
    );
}

/**
 * Fetch all campaigns from the server.
 *
 * @returns A list of campaign overviews.
 */
export async function getCampaigns(): Promise<api.CampaignResponse> {
    return request("/campaign/all", {}).then((data) => {
        return {
            Campaigns: (data as CampaignOverviewJSON[]).map((c) => {
                return new CampaignOverview(c.id, c.Name, c.Description, dateFromString(c.CreationDate), dateFromString(c.LastModified));
            }),
        };
    });
}

/**
 * Fetch a single campaign from the server.
 *
 * @param campaignID The ID of the campaign to fetch.
 *
 * @returns The campaign data.
 */
export async function getCampaign(campaignID: number): Promise<api.SingleCampaignResponse> {
    return request("/campaign", {
        id: campaignID.toString(),
    }).then((data) => {
        return {
            Campaign: Campaign.loadFromJSON(data as CampaignJSON),
        };
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
    return push("/campaign", campaign).then((data) => {
        return Campaign.loadFromJSON(data as CampaignJSON);
    });
}

/**
 * Delete a campaign from the server.
 *
 * @param campaignID The ID of the campaign to delete.
 *
 * @returns A boolean indicating success or failure.
 */
export async function deleteCampaign(campaignID: number): Promise<boolean> {
    return deleteRequest("/campaign", campaignID.toString()).then(
        () => {
            return true;
        },
        () => {
            return false;
        }
    );
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
    return push("/campaign", campaign).then((data) => {
        return Campaign.loadFromJSON(data as CampaignJSON);
    });
}

/**
 * Fetch a player statblock from the server, either by ID or by Player object.
 *
 * @param id The ID of the player to fetch (optional if player is provided).
 * @param player The Player object to fetch (optional if id is provided).
 *
 * @returns The player data.
 */
export async function getPlayerEntity(id?: number, player?: Player): Promise<api.SingleStatBlockResponse> {
    if ((id === undefined && player === undefined) || (id !== undefined && player !== undefined)) {
        throw new Error("Exactly 1 of [id, player] must be provided.");
    }

    let entityID: number;
    if (id !== undefined) {
        entityID = id;
    } else {
        entityID = player!.StatBlock.ID;
    }

    return request("/player", {
        id: entityID.toString(),
    }).then((data) => {
        return {
            StatBlock: parseDataAsStatBlock(data as StatBlockJSON),
        };
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
    return push("/player", player).then((data) => {
        return Player.loadFromJSON(data as PlayerJSON);
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
    return deleteRequest("/player", `${player.Campaign},${player.RowID}`).then(
        () => {
            return true;
        },
        () => {
            return false;
        }
    );
}

/**
 * Retrieve all types from the server.
 *
 * @returns A list of types.
 */
export async function getTypes(): Promise<api.TypeResponse> {
    return request("/type/all", {}).then((data) => {
        return {
            Types: data as string[],
        };
    });
}

/**
 * Retrieve all sizes from the server.
 *
 * @returns A list of sizes.
 */
export async function getSizes(): Promise<api.SizeResponse> {
    return request("/size/all", {}).then((data) => {
        return {
            Sizes: data as string[],
        };
    });
}

/**
 * Retrieve all sources from the server.
 *
 * @returns A list of sources.
 */
export async function getUsedSources(): Promise<api.SourceResponse> {
    return request("/source/used/all", {}).then((data) => {
        return {
            Sources: data as string[],
        };
    });
}
