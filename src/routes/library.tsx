import { createFileRoute } from "@tanstack/react-router"
import { StatBlockDisplay } from "@src/components/stat_block"
import { arasta } from "@src/temp/arasta"
import { LairDisplay } from "@src/components/lair"
import { aurelia } from "@src/temp/aurelia"
import { winter_ghoul } from "@src/temp/winter-ghoul"

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {
    return (
        <div>
            <p>
                This is the library.
            </p>

            <StatBlockDisplay statBlock={arasta} />
            <LairDisplay name="Arasta" lair={arasta.Lair} />
            <StatBlockDisplay statBlock={aurelia} />
            <StatBlockDisplay statBlock={winter_ghoul} />
        </div>
    )
}
