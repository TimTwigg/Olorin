import { Entity } from "@src/models/entity";
import { CounterMap } from "@src/models/data_structures/counterMap";
import { Lair } from "@src/models/lair";

export type EncounterMetadata = {
    CreationDate?: Date,
    AccessedDate?: Date,
    Campaign?: string,
    Started?: boolean,
    Round?: number,
    Turn?: number
}

export class Encounter {
    Name: string
    Description: string
    Metadata: EncounterMetadata
    Entities: Entity[] = []
    HasLair: boolean = false
    Lair?: Lair = undefined
    LairEntityName: string = ""
    ActiveID: string = ""
    InitiativeOrder: [string, number][] = []

    constructor(name: string = "", description: string = "", Campaign: string = "") {
        this.Name = name
        this.Description = description
        this.Metadata = {
            CreationDate: new Date(),
            AccessedDate: new Date(),
            Campaign: Campaign,
            Started: false,
            Round: 1,
            Turn: 1
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
        return this.setInitiativeOrder();
    }

    /**
     * Remove an entity from the encounter
     * 
     * @param entity the id of the entity to remove
     * @returns the updated encounter
     */
    removeEntity(entityID: string): Encounter {
        this.Entities = this.Entities.filter((e) => e.id !== entityID);
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
            if (ent.id === this.ActiveID) {
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
        this.Metadata.Turn = 1;
        this.Metadata.Round = 1;
        this.Metadata.Started = false;
        this.ActiveID = "";
        this.setInitiativeOrder();
        this.recalculateEntitySuffixes();
        return this;
    }

    /**
     * Set the initiative order of the encounter
     * 
     * @returns the updated encounter
     */
    setInitiativeOrder(): Encounter {
        this.InitiativeOrder = this.Entities.map((e) => [e.id, e.Initiative]);
        if (this.HasLair) this.InitiativeOrder.push([`${this.LairEntityName}_lair`, this.Lair?.Initiative || 20]);
        this.InitiativeOrder.sort(Encounter.InitiativeSortKey);
        if (!this.Metadata.Started) this.ActiveID = this.InitiativeOrder[0][0];
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
    withLair(lair: Lair | undefined, Name: string): Encounter {
        this.HasLair = lair !== undefined;
        this.Lair = lair;
        this.LairEntityName = Name;
        if (lair && this.InitiativeOrder.length === this.Entities.length) this.InitiativeOrder.push([`${Name}_lair`, lair.Initiative]);
        return this;
    }

    /**
     * Make a copy of the encounter
     * 
     * @returns a new encounter
     */
    copy(): Encounter {
        let newEncounter = new Encounter(this.Name, this.Description);
        // newEncounter.Entities = this.Entities.map((e) => e.copy());
        Object.assign(newEncounter, this);
        return newEncounter;
    }

    public static InitiativeSortKey(a: [string, number], b: [string, number]): number {
        let num_a = a[0].endsWith("lair") ? a[1] - 0.5 : a[1];
        let num_b = b[0].endsWith("lair") ? b[1] - 0.5 : b[1];
        return num_b - num_a;
    }
}