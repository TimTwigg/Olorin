import { Entity } from "@src/models/entity"

export interface Encounter {
    Name: string
    Description: string
    Entities: Entity[]
}