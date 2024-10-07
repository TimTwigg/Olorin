import { Entity } from "@src/models/entity"
import { SmartMap } from "@src/models/smartMap"

export class Encounter {
    Name: string
    Description: string
    Metadata: {
        CreationDate: Date,
        Campaign: string,
    }
    Entities: Entity[] = []

    constructor(name: string, description: string, Campaign: string = "") {
        this.Name = name
        this.Description = description
        this.Metadata = {
            CreationDate: new Date(),
            Campaign: Campaign
        }
    }

    addEntity(entity: Entity): void {
        let entityCounts = new SmartMap<string, number>();
        for (let entity of this.Entities) {
            entityCounts.set(entity.Name, entityCounts.dGet(entity.Name, 0) + 1);
        }
        if (entityCounts.get(entity.Name) === 1) {
            this.Entities.forEach((e) => {if (e.Name === entity.Name) e.setSuffix("1")});
            entity.setSuffix("2");
        }
        else if (entityCounts.get(entity.Name) > 1) {
            entity.setSuffix((entityCounts.get(entity.Name)+1).toString());
        }
        this.Entities.push(entity);
    }

    tick(): void {
        for (let entity of this.Entities) {
            entity.tick()
        }
    }

    clear(): void {
        this.Entities.filter((e) => (e.EncounterLocked));
    }
}