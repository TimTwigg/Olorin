import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ToastContainer, toast } from "react-toastify";
import * as api from "@src/controllers/api";

export const Route = createFileRoute("/profile")({
    component: Profile,
})

function Profile() {
    const [metadata, SetMetadata] = React.useState<Map<string, string>>(new Map<string, string>());
    const metaRef = React.useRef<number>(0);

    const [displayName, SetDisplayName] = React.useState<string>("");

    const SetIfAvailable = (key: string, data: Map<string, string>, setter: (val: string) => void) => {
        if (data.has(key)) {
            setter(data.get(key)!)
        }
    }

    const SetLocalVariables = (data: Map<string, string>) => {
        SetIfAvailable("displayName", data, SetDisplayName);
    }

    const SaveMetadata = async () => {
        let new_meta = new Map<string, string>(metadata);
        new_meta.set("displayName", displayName);
        api.setMetadata(new_meta).then((data) => {
            SetMetadata(data.Metadata);
            SetLocalVariables(data.Metadata);
            toast.success("Profile updated successfully!");
        });
        window.location.reload();
    }

    React.useEffect(() => {
        if (metaRef.current === 0) {
            metaRef.current = 1;
            api.getMetadata().then((data) => {
                SetMetadata(data.Metadata);
                SetLocalVariables(data.Metadata);
            });
        }
    }, []);

    return (
        <SessionAuth onSessionExpired={async () => {
            await Session.signOut();
            window.location.href = "/auth";
        }}>
            <h1>Profile</h1>
            <form>
                <label htmlFor="displayName">Display Name:</label>
                <input id="displayName" type="text" value={displayName} onChange={(e) => { SetDisplayName(e.target.value) }} />
                <div className="break" />
                <input type="submit" value="Save" onClick={(e) => {
                    e.preventDefault();
                    SaveMetadata();
                }} />
            </form>
            <ToastContainer position="top-right" />
        </SessionAuth>
    );
}
