import { createFileRoute } from "@tanstack/react-router";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {
    return (
        <>
            <SessionAuth>
                <p>
                    This is the library.
                </p>
            </SessionAuth>
        </>
    )
}
