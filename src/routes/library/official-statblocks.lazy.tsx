import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";
import { StatBlockList } from "@src/components/statBlockList";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createLazyFileRoute("/library/official-statblocks")({
    component: OfficialStatBlocks,
});

function OfficialStatBlocks() {
    const context = useRouteContext({ from: "__root__" });

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <div style={{ fontSize: "16px" }}>
                <StatBlockList filter="official" context={context} />
            </div>
        </SessionAuth>
    );
}
