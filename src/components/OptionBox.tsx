import * as React from "react";
import Session from "supertokens-auth-react/recipe/session";
import { useRouter, Link } from "@tanstack/react-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import * as api from "@src/controllers/api";

type AuthBoxProps = {};

export function OptionBox({}: AuthBoxProps) {
    const [displayName, SetDisplayName] = React.useState<string | null>(null);
    const metaRef = React.useRef<number>(0);
    const router = useRouter();

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
        router.invalidate();
        window.location.href = "/";
    };

    return (
        <div className="relative">
            {displayName ? (
                <Menu as="div" className="relative">
                    <MenuButton className="flex items-center gap-2 px-4 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <i className="pi pi-user"></i>
                        <span>
                            {displayName.substring(0, 20)}
                            {displayName.length > 20 ? "..." : ""}
                        </span>
                        <i className="pi pi-chevron-down text-xs"></i>
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg focus:outline-none z-50">
                        <div className="py-1">
                            <MenuItem>
                                <Link to="/profile" className="w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300 flex items-center gap-2 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700">
                                    <i className="pi pi-user"></i>
                                    Profile
                                </Link>
                            </MenuItem>
                            <MenuItem>
                                <button onClick={signOut} className="w-full text-left px-4 py-2 text-base text-gray-700 dark:text-gray-300 flex items-center gap-2 data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-700">
                                    <i className="pi pi-sign-out"></i>
                                    Sign Out
                                </button>
                            </MenuItem>
                        </div>
                    </MenuItems>
                </Menu>
            ) : (
                <button
                    onClick={() => {
                        window.location.href = "/auth";
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md text-base font-medium transition-colors"
                >
                    <i className="pi pi-sign-in"></i>
                    Sign In
                </button>
            )}
        </div>
    );
}
