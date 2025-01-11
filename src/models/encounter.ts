import { Entity } from "@src/models/entity";
import { CounterMap } from "./data_structures/counterMap";

export type EncounterMetadata = {
    CreationDate?: Date,
    AccessedDate?: Date,
    Started?: boolean,
    Campaign?: string,
}

export class Encounter {
    Name: string
    Description: string
    Metadata: EncounterMetadata
    Entities: Entity[] = []

    constructor(name: string = "", description: string = "", Campaign: string = "") {
        this.Name = name
        this.Description = description
        this.Metadata = {
            CreationDate: new Date(),
            AccessedDate: new Date(),
            Started: false,
            Campaign: Campaign
        }
    }

    addEntity(entity: Entity): Encounter {
        let entityCounts = new CounterMap<string>();
        for (let e of this.Entities) {
            entityCounts.increment(e.Name);
        }
        if (entityCounts.get(entity.Name) === 1) {
            this.Entities.forEach((e) => {if (e.Name === entity.Name) e.setSuffix("1")});
        }
        entity.setSuffix((entityCounts.get(entity.Name)+1).toString());
        this.Entities.push(entity);
        return this;
    }

    tick(): void {
        for (let entity of this.Entities) {
            entity.tick();
        }
    }

    clear(): void {
        this.Entities.filter((e) => (e.EncounterLocked));
    }

    reset(): Encounter {
        this.Entities.forEach((e) => e.resetAll());
        this.Metadata.Started = false;
        return this;
    }

    withName(name: string): Encounter {
        this.Name = name;
        return this;
    }

    withDescription(description: string): Encounter {
        this.Description = description;
        return this;
    }
}