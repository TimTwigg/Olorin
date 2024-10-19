import { Entity, EntityOverview } from "@src/models/entity"

export type EntityResponse = {
    Entities: Entity[]|EntityOverview[]
}

export type SingleEntityResponse = {
    Entity: Entity|undefined
}