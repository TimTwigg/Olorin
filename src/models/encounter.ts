import { Entity } from "@src/models/entity";
import { CounterMap } from "@src/models/data_structures/counterMap";
import { Lair } from "@src/models/lair";

export type EncounterMetadata = {
    CreationDate?: Date,
    AccessedDate?: Date,
    Campaign?: string,
    Started?: boolean,
    Round?: number,
    Index?: number
}

export class Encounter {
    Name: string
    Description: string
    Metadata: EncounterMetadata
    Entities: Entity[] = []
    HasLair: boolean = false
    Lair?: Lair = undefined
    LairEntityName: string = ""
    ActiveEntity: number = 0

    constructor(name: string = "", description: string = "", Campaign: string = "") {
        this.Name = name
        this.Description = description
        this.Metadata = {
            CreationDate: new Date(),
            AccessedDate: new Date(),
            Campaign: Campaign,
            Started: false,
            Round: 1,
            Index: 0
        };
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
        return this;
    }

    /**
     * Remove an entity from the encounter
     * 
     * @param entity the id of the entity to remove
     * @returns the updated encounter
     */
    removeEntity(entityID: string): Encounter {
        this.Entities = this.Entities.filter((e) => e.id !== entityID);
        if (this.Metadata.Started && this.Entities.length > 1) {
            if (this.Entities.findIndex((e) => e.id === entityID) < this.ActiveEntity) this.ActiveEntity = this.ActiveEntity - 1;
        }
        return this.recalculateEntitySuffixes();
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
        this.Entities[this.Metadata.Index!].tick();
        let num = this.Metadata.Index! + 1;
        if (num === this.Entities.length) {
            this.Metadata.Round!++;
            num = 0;
        }
        this.Metadata.Index = num;
        return this;
    }

    /**
     * Clear all non-locked entities from the encounter
     * 
     * @returns the updated encounter
     */
    clear(): Encounter {
        this.Entities.filter((e) => (e.EncounterLocked));
        return this;
    }

    /**
     * Reset the state of the encounter and all contained entities
     * 
     * @returns the updated encounter
     */
    reset(): Encounter {
        this.Entities.forEach((e) => e.resetAll());
        this.Metadata.Index = 0;
        this.Metadata.Round = 1;
        this.Metadata.Started = false;
        return this.recalculateEntitySuffixes();
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
            Index: metadata.Index === undefined ? this.Metadata.Index : metadata.Index,
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
     * Make a copy of the encounter
     * 
     * @returns a new encounter
     */
    copy(): Encounter {
        let newEncounter = new Encounter(this.Name, this.Description);
        newEncounter.Metadata = this.Metadata;
        newEncounter.Entities = this.Entities.map((e) => e.copy());
        return newEncounter;
    }
}