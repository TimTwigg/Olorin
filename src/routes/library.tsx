import { createFileRoute } from "@tanstack/react-router"
import { StatBlockDisplay } from "@src/models/stat_block"
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

            <StatBlockDisplay statBlock={winter_ghoul} />
        </div>
    )
}
