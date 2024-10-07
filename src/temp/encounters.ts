import { StatBlockEntity } from "@src/models/statBlockEntity"
import { Encounter } from "@src/models/encounter"
import { winter_ghoul } from "./winter-ghoul"
import { arasta } from "./arasta"
import { aurelia } from "./aurelia"

let e1 = new Encounter(
    "Encounter 1",
    "A simple encounter with two winter ghouls.",
    "Campaign 1"
)

e1.addEntity(new StatBlockEntity(winter_ghoul))
e1.addEntity(new StatBlockEntity(winter_ghoul))

let e2 = new Encounter(
    "Encounter 2",
    "A deathly encounter with Aurelia and Arasta.",
    "Campaign 1"
)

e2.addEntity(new StatBlockEntity(aurelia))
e2.addEntity(new StatBlockEntity(arasta))

export const encounters = [
    e1,
    e2
]