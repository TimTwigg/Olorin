import { createFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {
    return (
        <SessionAuth onSessionExpired={async () => {
            await Session.signOut();
            window.location.href = "/auth";
        }}>
            <p>
                This is the library.
            </p>
        </SessionAuth>
    )
}
