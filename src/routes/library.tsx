import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {
    return (
        <>
            <p>
                This is the library.
            </p>
        </>
    )
}
