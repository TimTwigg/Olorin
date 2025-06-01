import { Entity } from "@src/models/entity";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { CounterMap } from "@src/models/data_structures/counterMap";
import { Lair } from "@src/models/lair";
import { deepCopy, dateFromString } from "@src/controllers/utils";

export type EncounterMetadata = {
    CreationDate?: Date,
    AccessedDate?: Date,
    Campaign?: string,
    Started?: boolean,
    Round?: number,
    Turn?: number
}

export type EncounterOverviewT = {
    id: number,
    Name: string,
    Description: string,
    Metadata: EncounterMetadata
}

export class EncounterOverview implements EncounterOverviewT {
    id: number
    Name: string
    Description: string
    Metadata: EncounterMetadata

    constructor(id: number, name: string, description: string, metadata: EncounterMetadata) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? new Date() : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? new Date() : metadata.AccessedDate,
            Campaign: metadata.Campaign === undefined ? "" : metadata.Campaign,
            Started: metadata.Started === undefined ? false : metadata.Started,
            Turn: metadata.Turn === undefined ? 1 : metadata.Turn,
            Round: metadata.Round === undefined ? 1 : metadata.Round,
        };
    }
}

export class Encounter {
    id: number
    Name: string
    Description: string
    Metadata: EncounterMetadata
    Entities: Entity[] = []
    HasLair: boolean = false
    Lair?: Lair = undefined
    LairOwnerID: number = -1
    ActiveID: string = ""
    InitiativeOrder: [string, number][] = []

    constructor(id: number, name: string = "", description: string = "", Campaign: string = "", metadata: EncounterMetadata = {}) {
        this.id = id;
        this.Name = name;
        this.Description = description;
        this.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? new Date() : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? new Date() : metadata.AccessedDate,
            Campaign: metadata.Campaign === undefined ? Campaign : metadata.Campaign,
            Started: metadata.Started === undefined ? false : metadata.Started,
            Turn: metadata.Turn === undefined ? 1 : metadata.Turn,
            Round: metadata.Round === undefined ? 1 : metadata.Round,
        };

        if (Campaign !== "") {
            console.log("[WARNING] Encounter created with campaign: " + Campaign);
        }
    }

    /**
     * Add an entity to the encounter
     * 
     * @param entity the new entity
     * @returns the updated encounter
     */
    addEntity(entity: Entity): Encounter {
        let entityCounts = new CounterMap<string>();
        for (let e of this.Entities) {
            entityCounts.increment(e.Name);
        }
        if (entityCounts.get(entity.Name) === 1) {
            this.Entities.forEach((e) => { if (e.Name === entity.Name) e.setSuffix("1") });
        }
        let num = entityCounts.get(entity.Name) + 1 || 0;
        if (num > 0) entity.setSuffix(num.toString());
        this.Entities.push(entity);
        return this.setInitiativeOrder();
    }

    /**
     * Remove an entity from the encounter
     * 
     * @param entity the id of the entity to remove
     * @returns the updated encounter
     */
    removeEntity(entityID: string): Encounter {
        this.Entities = this.Entities.filter((e) => e.ID !== entityID);
        if (entityID === this.ActiveID) {
            let pos = this.InitiativeOrder.findIndex((id) => id[0] === entityID);
            this.ActiveID = this.InitiativeOrder[pos + 1][0] || this.InitiativeOrder[0][0] || "";
        }
        this.InitiativeOrder = this.InitiativeOrder.filter((id) => id[0] !== entityID);
        this.recalculateEntitySuffixes();
        return this;
    }

    /**
     * Recalculate the suffixes of all entities in the encounter
     * 
     * @returns the updated encounter
     */
    recalculateEntitySuffixes(): Encounter {
        let entityCounts = new CounterMap<string>();
        let nameCounts = new CounterMap<string>();
        for (let e of this.Entities) entityCounts.increment(e.Name);
        for (let e of this.Entities) {
            let num = entityCounts.get(e.Name);
            if (num < 2) {
                e.setSuffix("");
                continue;
            }
            nameCounts.increment(e.Name);
            e.setSuffix(nameCounts.get(e.Name).toString());
        }
        return this;
    }

    /**
     * Tick the encounter, advancing the state of the active entity 
     * 
     * @returns the updated encounter
     */
    tick(): Encounter {
        for (let ent of this.Entities) {
            if (ent.ID === this.ActiveID) {
                ent.tick();
                break;
            }
        }
        let num = this.Metadata.Turn!;
        if (num === this.InitiativeOrder.length) {
            this.Metadata.Round!++;
            num = 0;
        }
        this.Metadata.Turn = num + 1;
        this.ActiveID = this.InitiativeOrder[num][0];
        return this;
    }

    /**
     * Clear all non-locked entities from the encounter
     * 
     * @returns the updated encounter
     */
    clear(): Encounter {
        let ents: Entity[] = [];
        this.Entities.forEach((e) => {
            if (e.EncounterLocked) ents.push(e);
        });
        this.Entities = ents;
        return this;
    }

    /**
     * Reset the state of the encounter and all contained entities
     * 
     * @returns the updated encounter
     */
    reset(): Encounter {
        this.Entities.forEach((e) => e.resetAll());
        this.Metadata.Turn = 1;
        this.Metadata.Round = 1;
        this.Metadata.Started = false;
        this.ActiveID = "";
        this.setInitiativeOrder();
        this.recalculateEntitySuffixes();
        return this;
    }

    /**
     * Randomize the initiative of all entities in the encounter
     * 
     * @returns the updated encounter
     */
    randomizeInitiative(): Encounter {
        this.Entities.forEach((e) => e.randomizeInitiative());
        this.setInitiativeOrder();
        return this;
    }

    /**
     * Set the initiative order of the encounter
     * 
     * @returns the updated encounter
     */
    setInitiativeOrder(): Encounter {
        this.InitiativeOrder = this.Entities.map((e) => [e.ID, e.Initiative]);
        if (this.HasLair && this.LairOwnerID > 0) this.InitiativeOrder.push([`${this.LairOwnerID}_lair`, this.Lair?.Initiative || 20]);
        this.InitiativeOrder.sort(Encounter.InitiativeSortKey);
        if (!this.Metadata.Started && this.InitiativeOrder.length > 0) this.ActiveID = this.InitiativeOrder[0][0];
        return this;
    }

    /**
     * Update the encounter name
     * 
     * @returns the updated encounter
     */
    withName(name: string): Encounter {
        this.Name = name;
        return this;
    }

    /**
     * Update the encounter description
     * 
     * @returns the updated encounter
     */
    withDescription(description: string): Encounter {
        this.Description = description;
        return this;
    }

    /**
     * Update the encounter metadata
     * 
     * @returns the updated encounter
     */
    withMetadata(metadata: EncounterMetadata): Encounter {
        this.Metadata = {
            CreationDate: metadata.CreationDate === undefined ? this.Metadata.CreationDate : metadata.CreationDate,
            AccessedDate: metadata.AccessedDate === undefined ? this.Metadata.AccessedDate : metadata.AccessedDate,
            Campaign: metadata.Campaign === undefined ? this.Metadata.Campaign : metadata.Campaign,
            Started: metadata.Started === undefined ? this.Metadata.Started : metadata.Started,
            Turn: metadata.Turn === undefined ? this.Metadata.Turn : metadata.Turn,
            Round: metadata.Round === undefined ? this.Metadata.Round : metadata.Round,
        }
        return this;
    }

    /**
     * Update the encounter entity list
     * 
     * @returns the updated encounter
     */
    withEntities(entities: Entity[]): Encounter {
        this.Entities = entities;
        return this;
    }

    /**
     * Update the encounter lair
     * 
     * @returns the updated encounter
     */
    withLair(lair: Lair | undefined): Encounter {
        this.HasLair = lair !== undefined;
        this.Lair = lair;
        this.LairOwnerID = lair !== undefined ? lair.OwningEntityDBID : -1;
        this.setInitiativeOrder();
        return this;
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
        newEncounter.setInitiativeOrder();
        if (!this.Metadata.Started) this.ActiveID = this.InitiativeOrder[0][0];
        else {
            let index = this.InitiativeOrder.findIndex((item) => item[0] === this.ActiveID);
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
            Metadata: deepCopy(this.Metadata)
        };
    }

    // toJSON(): any {
    //     // TODO
    // }

    public static InitiativeSortKey(a: [string, number], b: [string, number]): number {
        let num_a = a[0].endsWith("lair") ? a[1] - 0.5 : a[1];
        let num_b = b[0].endsWith("lair") ? b[1] - 0.5 : b[1];
        return num_b - num_a;
    }

    public static loadFromJSON(json: any): Encounter {
        let encounter = new Encounter(json.ID, json.Name, json.Description, "", json.Metadata);
        encounter.Metadata = {
            CreationDate: json.Metadata.CreationDate === undefined ? new Date() : dateFromString(json.Metadata.CreationDate),
            AccessedDate: json.Metadata.AccessedDate === undefined ? new Date() : dateFromString(json.Metadata.AccessedDate),
            Campaign: json.Metadata.Campaign === undefined ? "" : json.Metadata.Campaign,
            Started: json.Metadata.Started === undefined ? false : json.Metadata.Started,
            Round: json.Metadata.Round === undefined ? 1 : json.Metadata.Round,
            Turn: json.Metadata.Turn === undefined ? 1 : json.Metadata.Turn
        };
        encounter.Entities = json.Entities.map((e: any) => StatBlockEntity.loadFromJSON(e)); // TODO - should this bifurcate to different entity types? Or Players/Temps ARE statblock entities?
        encounter.ActiveID = json.ActiveID;
        encounter.HasLair = json.HasLair;
        encounter.LairOwnerID = json.LairOwnerID || -1;
        encounter.Lair = json.Lair ? Lair.loadFromJSON(json.Lair) : undefined;
        encounter.setInitiativeOrder();
        return encounter;
    }
}