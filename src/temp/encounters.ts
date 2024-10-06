import { StatBlockEntity } from "@src/models/statBlockEntity"
import { Encounter } from "@src/models/encounter"
import { winter_ghoul } from "./winter-ghoul"

export const encounters = [
    new Encounter(
        "Encounter 1",
        "A simple encounter with two winter ghouls.",
        "Campaign 1",
        [
            new StatBlockEntity(winter_ghoul),
            new StatBlockEntity(winter_ghoul)
        ]
    )
]