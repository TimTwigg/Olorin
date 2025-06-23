import * as React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ToastContainer, toast } from "react-toastify";
import * as api from "@src/controllers/api";
import "@src/styles/profile.scss";

export const Route = createLazyFileRoute("/profile")({
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
            <p className="ten columns offset-by-one column">
                <strong>Current Data</strong><br />
                <u>Email:</u> {metadata.get("email") || "Not Available"}<br />
                <u>Display Name:</u> {metadata.get("displayName") || "Not Available"}<br />
            </p>
            <div className="break" />
            <hr />
            <strong className="ten columns offset-by-one column" >Update Profile</strong><br />
            <form id="updateProfileForm" className="ten columns offset-by-one column">
                <label htmlFor="displayName">Display Name:</label>
                <input id="displayName" type="text" value={displayName} onChange={(e) => { SetDisplayName(e.target.value) }} />
                <div className="break" />
                <input className="two columns offset-by-nine columns" type="submit" value="Save" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    SaveMetadata();
                }} />
            </form>
            <ToastContainer position="top-right" />
        </SessionAuth>
    );
}
