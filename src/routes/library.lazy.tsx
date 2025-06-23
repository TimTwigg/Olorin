import { createLazyFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createLazyFileRoute("/library")({
    component: Library,
})

function Library() {
    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut()
                window.location.href = "/auth"
            }}
        >
            <h1>Library</h1>
            <p>This is the library.</p>
        </SessionAuth>
    )
}
