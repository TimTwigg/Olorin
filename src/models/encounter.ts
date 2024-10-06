import { Entity } from "@src/models/entity"

export class Encounter {
    Name: string
    Description: string
    Metadata: {
        CreationDate: Date,
        Campaign: string,
    }
    Entities: Entity[]

    constructor(name: string, description: string, Campaign: string = "", entities: Entity[] = []) {
        this.Name = name
        this.Description = description
        this.Entities = entities
        this.Metadata = {
            CreationDate: new Date(),
            Campaign: Campaign
        }
    }

    addEntity(entity: Entity): void {
        this.Entities.push(entity);
        this.Entities.sort((a, b) => b.Initiative - a.Initiative);
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