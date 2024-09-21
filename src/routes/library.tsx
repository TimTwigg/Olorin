import { createFileRoute } from "@tanstack/react-router"
import { EntityDisplay } from "@src/components/entityDisplay"
import { StatBlockEntity } from "@src/models/statBlockEntity"

import { arasta } from "@src/temp/arasta"
import { aurelia } from "@src/temp/aurelia"
import { winter_ghoul } from "@src/temp/winter-ghoul"

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {

    return (
        <>
            <p>
                This is the library.
            </p>

            <EntityDisplay entity={new StatBlockEntity(arasta, 5)} expanded = {true}/>
            <EntityDisplay entity={new StatBlockEntity(aurelia, 5)}/>
            <EntityDisplay entity={new StatBlockEntity(winter_ghoul, 5)}/>
        </>
    )
}
