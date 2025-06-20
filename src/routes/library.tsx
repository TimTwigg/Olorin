import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import * as api from "@src/controllers/api";

export const Route = createFileRoute("/library")({
    component: Library,
})

function Library() {
    const [metadata, SetMetadata] = React.useState<Map<string, string>>(new Map<string, string>());
    const metaRef = React.useRef<number>(0);

    const [name, SetName] = React.useState<string>("");


    const SaveMetadata = async (key: string, value: string) => {
        let new_meta = metadata.set(key, value);
        SetMetadata(new_meta);
        api.setMetadata(new_meta).then((data) => {
            SetMetadata(data.Metadata);
            if (data.Metadata.has("name")) {
                SetName(data.Metadata.get("name") || "");
            }
        });
    }

    React.useEffect(() => {
        if (metaRef.current === 0) {
            metaRef.current = 1;
            api.getMetadata().then((data) => {
                SetMetadata(data.Metadata);
                if (data.Metadata.has("name")) {
                    SetName(data.Metadata.get("name") || "");
                }
            });
        }
    }, [metaRef]);

    return (
        <SessionAuth onSessionExpired={async () => {
            await Session.signOut();
            window.location.href = "/auth";
        }}>
            <p>
                This is the library.
            </p>
            <p>
                {Array.from(metadata.entries()).map(([k, v]) => {return <span key={k}>{k}: {v}<br/></span>})}
            </p>
            <hr/>
            <p>
                Name: {metadata.get("name") || "Not set"} <br/>
                New Name: {name}
            </p>
            <input type="text" value={name} onChange={(e) => {SetName(e.target.value)}} />
            <button onClick={() => {SaveMetadata("name", name)}}>Save Name</button>
        </SessionAuth>
    )
}
