import * as React from "react";
import Session from "supertokens-auth-react/recipe/session";
// import {
//     Menu,
//     MenuButton,
//     MenuItem,
//     MenuItems,
// } from "@headlessui/react";

import "@src/styles/authBox.scss";

type AuthBoxProps = {}

export function AuthBox({ }: AuthBoxProps) {
    const [userName, SetUserName] = React.useState<string | null>(null);

    React.useEffect(() => {
        Session.doesSessionExist().then((exists) => {
            if (exists) {
                Session.getUserId().then((userId) => {
                    if (userId) {
                        SetUserName(userId);
                    } else {
                        SetUserName(null);
                    }
                });
            } else {
                SetUserName(null);
            }
        });
    }, []);

    const signOut = async () => {
        await Session.signOut();
        window.location.href = "/auth";
    }

    return (
        <span className="authBox">
            {userName ? (
                <div>
                    <span>{userName.substring(0, 20)}{userName.length > 20 ? "..." : ""}</span>
                    <button onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <div>
                    <span>Please sign in.</span>
                    <button onClick={() => {window.location.href = "/auth"}}>Sign In</button>
                </div>
            )}
        </span>
    );
}