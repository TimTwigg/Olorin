import { createFileRoute } from "@tanstack/react-router"
import { StatBlockDisplay } from "@src/components/statBlockDisplay"
import { arasta } from "@src/temp/arasta"
// import { LairDisplay } from "@src/components/lair"
// import { aurelia } from "@src/temp/aurelia"
// import { winter_ghoul } from "@src/temp/winter-ghoul"
import { EntityDisplay } from "@src/components/entityDisplay"
import { StatBlockEntity } from "@src/models/statBlockEntity"

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {

    return (
        <>
            <p>
                This is the library.
            </p>

            <StatBlockDisplay statBlock={arasta} />
            <EntityDisplay entity={new StatBlockEntity(arasta, 5)} expanded = {true}/>
        </>
    )
}
