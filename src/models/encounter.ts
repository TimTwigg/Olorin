import { Entity, EntityJSON } from "@src/models/entity";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { CounterMap } from "@src/models/data_structures/counterMap";
import { Lair } from "@src/models/lair";
import { deepCopy, dateFromString, newLocalDate } from "@src/controllers/utils";
import { CampaignOverview } from "@src/models/campaign";

export type EncounterMetadata = {
    CreationDate?: Date;
    AccessedDate?: Date;
    CampaignID?: number;
    Started?: boolean;
    Round?: number;
    Turn?: number;
};

export type EncounterMetadataJSON = {
    CreationDate: string;
    AccessedDate: string;
    CampaignID: number;
    Started: boolean;
    Round: number;
    Turn: number;
};

export type EncounterOverviewT = {
    id: number;
    Name: string;
    Description: string;
    Metadata: EncounterMetadata;
};

export type EncounterOverviewJSON = {
    id: number;
    Name: string;
    Description: string;
    Metadata: EncounterMetadataJSON;
};

export class EncounterOverview implements EncounterOverviewT {
    id: number;
    Name: string;
    Description: string;
    Metadata: EncounterMetadata;

    constructor(id: number, name: string, description: string, metadata: EncounterMetadata) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? newLocalDate() : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? newLocalDate() : metadata.AccessedDate,
            CampaignID: metadata.CampaignID === undefined ? -1 : metadata.CampaignID,
            Started: metadata.Started === undefined ? false : metadata.Started,
            Turn: metadata.Turn === undefined ? 1 : metadata.Turn,
            Round: metadata.Round === undefined ? 1 : metadata.Round,
        };
    }
}

export type EncounterJSON = {
    id: number;
    Name: string;
    Description: string;
    Metadata: EncounterMetadataJSON;
    Entities: EntityJSON[];
    HasLair: boolean;
    Lair?: Lair;
    LairOwnerID: number;
    ActiveID: string;
    InitiativeOrder: [string, number][];
};

export class Encounter {
    id: number;
    Name: string;
    Description: string;
    Metadata: EncounterMetadata;
    Entities: Entity[] = [];
    HasLair: boolean = false;
    Lair?: Lair = undefined;
    LairOwnerID: number = -1;
    ActiveID: string = "";
    InitiativeOrder: [string, number][] = [];

    constructor(id: number, name: string = "", description: string = "", CampaignID: number = -1, metadata: EncounterMetadata = {}) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? newLocalDate() : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? newLocalDate() : metadata.AccessedDate,
            CampaignID: metadata.CampaignID === undefined ? CampaignID : metadata.CampaignID,
            Started: metadata.Started === undefined ? false : metadata.Started,
            Turn: metadata.Turn === undefined ? 1 : metadata.Turn,
            Round: metadata.Round === undefined ? 1 : metadata.Round,
        };
    }

    /**
     * Create a shallow copy of this encounter (immutability helper)
     * @private
     */
    private clone(): Encounter {
        const newEncounter = new Encounter(this.id, this.Name, this.Description, -1, this.Metadata);
        Object.assign(newEncounter, this);
        // Deep copy arrays to prevent mutations
        newEncounter.Entities = [...this.Entities];
        newEncounter.InitiativeOrder = [...this.InitiativeOrder];
        return newEncounter;
    }

    /**
     * Add an entity to the encounter
     *
     * @param entity the new entity
     * @returns a new encounter with the entity added
     */
    addEntity(entity: Entity): Encounter {
        const newEncounter = this.clone();
        const entityCounts = new CounterMap<string>();
        for (const e of newEncounter.Entities) {
            entityCounts.increment(e.Name);
        }
        if (entityCounts.get(entity.Name) === 1) {
            newEncounter.Entities.forEach((e) => {
                if (e.Name === entity.Name) e.setSuffix("1");
            });
        }
        const num = entityCounts.get(entity.Name)! + 1 || 0;
        if (num > 0) entity.setSuffix(num.toString());
        newEncounter.Entities.push(entity);
        return newEncounter.setInitiativeOrder();
    }

    /**
     * Remove an entity from the encounter
     *
     * @param entity the id of the entity to remove
     * @returns a new encounter with the entity removed
     */
    removeEntity(entityID: string): Encounter {
        const newEncounter = this.clone();
        newEncounter.Entities = newEncounter.Entities.filter((e) => e.ID !== entityID);
        if (entityID === newEncounter.ActiveID) {
            const pos = newEncounter.InitiativeOrder.findIndex((id) => id[0] === entityID);
            newEncounter.ActiveID = newEncounter.InitiativeOrder[pos + 1]?.[0] || newEncounter.InitiativeOrder[0]?.[0] || "";
        }
        newEncounter.InitiativeOrder = newEncounter.InitiativeOrder.filter((id) => id[0] !== entityID);
        return newEncounter.recalculateEntitySuffixes();
    }

    /**
     * Recalculate the suffixes of all entities in the encounter
     *
     * @returns a new encounter with recalculated suffixes
     */
    recalculateEntitySuffixes(): Encounter {
        const newEncounter = this.clone();
        const entityCounts = new CounterMap<string>();
        const nameCounts = new CounterMap<string>();
        for (const e of newEncounter.Entities) entityCounts.increment(e.Name);
        for (const e of newEncounter.Entities) {
            const num = entityCounts.get(e.Name);
            if (num! < 2) {
                e.setSuffix("");
                continue;
            }
            nameCounts.increment(e.Name);
            e.setSuffix(nameCounts.get(e.Name)!.toString());
        }
        return newEncounter;
    }

    /**
     * Tick the encounter, advancing the state of the active entity
     *
     * @returns a new encounter with updated turn state
     */
    tick(): Encounter {
        const newEncounter = this.clone();
        for (const ent of newEncounter.Entities) {
            if (ent.ID === newEncounter.ActiveID) {
                ent.tick();
                break;
            }
        }
        let num = newEncounter.Metadata.Turn!;
        if (num === newEncounter.InitiativeOrder.length) {
            newEncounter.Metadata = { ...newEncounter.Metadata, Round: (newEncounter.Metadata.Round || 1) + 1 };
            num = 0;
        }
        newEncounter.Metadata = { ...newEncounter.Metadata, Turn: num + 1 };
        newEncounter.ActiveID = newEncounter.InitiativeOrder[num][0];
        return newEncounter;
    }

    /**
     * Clear all non-locked entities from the encounter
     *
     * @returns a new encounter with non-locked entities removed
     */
    clear(): Encounter {
        const newEncounter = this.clone();
        newEncounter.Entities = newEncounter.Entities.filter((e) => e.EncounterLocked);
        return newEncounter;
    }

    /**
     * Reset the state of the encounter and all contained entities
     *
     * @returns a new encounter with reset state
     */
    reset(): Encounter {
        const newEncounter = this.clone();
        newEncounter.Entities.forEach((e) => e.resetAll());
        newEncounter.Metadata = { ...newEncounter.Metadata, Turn: 1, Round: 1, Started: false };
        newEncounter.ActiveID = "";
        return newEncounter.setInitiativeOrder().recalculateEntitySuffixes();
    }

    /**
     * Randomize the initiative of all entities in the encounter
     *
     * @returns a new encounter with randomized initiative
     */
    randomizeInitiative(): Encounter {
        const newEncounter = this.clone();
        newEncounter.Entities.forEach((e) => e.randomizeInitiative());
        return newEncounter.setInitiativeOrder();
    }

    /**
     * Set the initiative order of the encounter
     *
     * @returns a new encounter with updated initiative order
     */
    setInitiativeOrder(): Encounter {
        const newEncounter = this.clone();
        newEncounter.InitiativeOrder = newEncounter.Entities.map((e) => [e.ID, e.Initiative]);
        if (newEncounter.HasLair && newEncounter.LairOwnerID > 0) {
            newEncounter.InitiativeOrder.push([`${newEncounter.LairOwnerID}_lair`, newEncounter.Lair?.Initiative || 20]);
        }
        newEncounter.InitiativeOrder.sort(Encounter.InitiativeSortKey);
        if (!newEncounter.Metadata.Started && newEncounter.InitiativeOrder.length > 0) {
            newEncounter.ActiveID = newEncounter.InitiativeOrder[0][0];
        }
        return newEncounter;
    }

    /**
     * Update the encounter name
     *
     * @returns a new encounter with updated name
     */
    withName(name: string): Encounter {
        const newEncounter = this.clone();
        newEncounter.Name = name;
        return newEncounter;
    }

    /**
     * Update the encounter description
     *
     * @returns a new encounter with updated description
     */
    withDescription(description: string): Encounter {
        const newEncounter = this.clone();
        newEncounter.Description = description;
        return newEncounter;
    }

    /**
     * Update the encounter metadata
     *
     * @returns a new encounter with updated metadata
     */
    withMetadata(metadata: EncounterMetadata): Encounter {
        const newEncounter = this.clone();
        newEncounter.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? newEncounter.Metadata.CreationDate : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? newEncounter.Metadata.AccessedDate : metadata.AccessedDate,
            CampaignID: metadata.CampaignID === undefined ? newEncounter.Metadata.CampaignID : metadata.CampaignID,
            Started: metadata.Started === undefined ? newEncounter.Metadata.Started : metadata.Started,
            Turn: metadata.Turn === undefined ? newEncounter.Metadata.Turn : metadata.Turn,
            Round: metadata.Round === undefined ? newEncounter.Metadata.Round : metadata.Round,
        };
        return newEncounter;
    }

    /**
     * Update the encounter entity list
     *
     * @returns a new encounter with updated entity list
     */
    withEntities(entities: Entity[]): Encounter {
        const newEncounter = this.clone();
        newEncounter.Entities = entities;
        return newEncounter;
    }

    /**
     * Update the encounter lair
     *
     * @returns a new encounter with updated lair
     */
    withLair(lair: Lair | undefined): Encounter {
        const newEncounter = this.clone();
        newEncounter.HasLair = lair !== undefined;
        newEncounter.Lair = lair;
        newEncounter.LairOwnerID = lair !== undefined ? lair.OwningEntityDBID : -1;
        return newEncounter.setInitiativeOrder();
    }

    /**
     * Get the name of the CampaignID this encounter belongs to
     *
     * @param campaigns the list of campaigns to search
     *
     * @returns the name of the CampaignID, or an empty string if not found
     */
    getCampaignNameFromContext(campaigns: CampaignOverview[]): string {
        const CampaignID = campaigns.find((c) => c.id === this.Metadata.CampaignID);
        return CampaignID ? CampaignID.Name : "";
    }

    /**
     * Make a copy of the encounter
     *
     * @returns a new encounter
     */
    copy(): Encounter {
        let newEncounter = new Encounter(this.id, this.Name, this.Description);
        Object.assign(newEncounter, this);
        newEncounter.Entities = this.Entities.map((e) => e.copy());
        if (newEncounter.Entities.length === 0) return newEncounter;
        newEncounter.ActiveID = this.ActiveID;
        newEncounter = newEncounter.setInitiativeOrder();
        if (!this.Metadata.Started) this.ActiveID = this.InitiativeOrder[0][0];
        else {
            const index = this.InitiativeOrder.findIndex((item) => item[0] === this.ActiveID);
            if (index === -1) {
                newEncounter.ActiveID = this.InitiativeOrder[0][0];
            } else {
                newEncounter.ActiveID = this.InitiativeOrder[index][0];
            }
        }
        return newEncounter;
    }

    /**
     * Get a summary of the encounter
     *
     * @returns a summary of the encounter
     */
    toOverview(): EncounterOverview {
        return {
            id: this.id,
            Name: this.Name,
            Description: this.Description,
            Metadata: deepCopy(this.Metadata),
        };
    }

    public static InitiativeSortKey(a: [string, number], b: [string, number]): number {
        const num_a = a[0].endsWith("lair") ? a[1] - 0.5 : a[1];
        const num_b = b[0].endsWith("lair") ? b[1] - 0.5 : b[1];
        return num_b - num_a;
    }

    public static loadFromJSON(json: EncounterJSON): Encounter {
        const metadata: EncounterMetadata = {
            CreationDate: json.Metadata.CreationDate === undefined ? newLocalDate() : dateFromString(json.Metadata.CreationDate),
            AccessedDate: json.Metadata.AccessedDate === undefined ? newLocalDate() : dateFromString(json.Metadata.AccessedDate),
            CampaignID: json.Metadata.CampaignID === undefined ? -1 : json.Metadata.CampaignID,
            Started: json.Metadata.Started === undefined ? false : json.Metadata.Started,
            Round: json.Metadata.Round === undefined ? 1 : json.Metadata.Round,
            Turn: json.Metadata.Turn === undefined ? 1 : json.Metadata.Turn,
        };
        const encounter = new Encounter(json.id, json.Name, json.Description, -1, metadata);
        encounter.Entities = json.Entities.map((e) => StatBlockEntity.loadFromJSON(e));
        encounter.ActiveID = json.ActiveID;
        encounter.HasLair = json.HasLair;
        encounter.LairOwnerID = json.LairOwnerID || -1;
        encounter.Lair = json.Lair ? Lair.loadFromJSON(json.Lair) : undefined;
        return encounter.setInitiativeOrder();
    }
}
