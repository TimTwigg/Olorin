import * as React from "react";
import Session from "supertokens-auth-react/recipe/session";
import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";

import * as api from "@src/controllers/api";

import "@src/styles/optionBox.scss";

type AuthBoxProps = {}

export function OptionBox({ }: AuthBoxProps) {
    const [displayName, SetDisplayName] = React.useState<string | null>(null);
    const metaRef = React.useRef<number>(0);

    React.useEffect(() => {
        if (metaRef.current === 0) {
            metaRef.current = 1;
            api.getDisplayName().then((name) => {
                if (name) SetDisplayName(name);
                else {
                    Session.doesSessionExist().then((exists) => {
                        if (exists) {
                            Session.getUserId().then((userId) => {
                                if (userId) {
                                    SetDisplayName(userId);
                                } else {
                                    SetDisplayName(null);
                                }
                            });
                        } else {
                            SetDisplayName(null);
                        }
                    });
                }
            });
        }
    }, []);

    const signOut = async () => {
        await Session.signOut();
        window.location.href = "/";
    }

    return (
        <>
            <div className="optionBox">
                {displayName ? (
                    <Menu as="div">
                        <MenuButton className="menuButton">
                            {displayName.substring(0, 20)}{displayName.length > 20 ? "..." : ""}
                        </MenuButton>
                        <MenuItems className="menuItems" anchor="bottom">
                            <MenuItem><button onClick={() => {window.location.href = "/profile"}}>Profile</button></MenuItem>
                            <MenuItem><button onClick={signOut}>Sign Out</button></MenuItem>
                        </MenuItems>
                    </Menu>
                ) : (
                    <div>
                        <button className="menuButton" onClick={() => {window.location.href = "/auth"}}>Sign In</button>
                    </div>
                )}
            </div>
    </>
    );
}