import * as React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { toast } from "react-toastify";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import * as api from "@src/controllers/api";
import { ColorScheme } from "@src/models/userOptions";

export const Route = createLazyFileRoute("/profile")({
    component: Profile,
});

function Profile() {
    const [metadata, SetMetadata] = React.useState<Map<string, string>>(new Map<string, string>());
    const metaRef = React.useRef<number>(0);
    const [saving, setSaving] = React.useState(false);

    const [displayName, SetDisplayName] = React.useState<string>("");
    const [theme, SetTheme] = React.useState<"light" | "dark" | "system">("system");
    const [colorScheme, SetColorScheme] = React.useState<ColorScheme>("gandalf-grey");

    const themeOptions = [
        { label: "Light Mode", value: "light", icon: "pi pi-sun" },
        { label: "Dark Mode", value: "dark", icon: "pi pi-moon" },
        { label: "System Default", value: "system", icon: "pi pi-desktop" },
    ];

    const colorSchemeOptions = [
        { label: "Gandalf the Grey", value: "gandalf-grey", description: "Slate grey with warm amber accents" },
        { label: "Gandalf the White", value: "gandalf-white", description: "Pure whites with brilliant gold" },
        { label: "Valinor", value: "valinor", description: "Ethereal blue-purples with silver" },
        { label: "Mithrandir", value: "mithrandir", description: "Deep midnight blues with starlight silver" },
    ];

    const SetIfAvailable = (key: string, data: Map<string, string>, setter: (val: string) => void) => {
        if (data.has(key)) {
            setter(data.get(key)!);
        }
    };

    const SetLocalVariables = (data: Map<string, string>) => {
        SetIfAvailable("displayName", data, SetDisplayName);
        SetIfAvailable("theme", data, (val) => SetTheme(val as "light" | "dark" | "system"));
        SetIfAvailable("colorScheme", data, (val) => SetColorScheme(val as ColorScheme));
    };

    const SaveMetadata = async () => {
        setSaving(true);
        const new_meta = new Map<string, string>(metadata);
        new_meta.set("displayName", displayName);
        new_meta.set("theme", theme);
        new_meta.set("colorScheme", colorScheme);

        try {
            const data = await api.setMetadata(new_meta);
            SetMetadata(data.Metadata);
            SetLocalVariables(data.Metadata);

            toast.success("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 500);
        } catch {
            toast.error("Failed to update profile");
            setSaving(false);
        }
    };

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
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" style={{ fontSize: "16px" }}>
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
                    </div>

                    {/* Account Information Card */}
                    <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="pi pi-user text-2xl text-blue-600 dark:text-blue-400"></i>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white my-0">Account Information</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Email (Read-only) */}
                                <div>
                                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <div className="flex items-center gap-2">
                                        <i className="pi pi-envelope text-gray-500"></i>
                                        <span className="text-base text-gray-900 dark:text-white">{metadata.get("email") || "Not Available"}</span>
                                    </div>
                                </div>

                                <Divider />

                                {/* Display Name */}
                                <div>
                                    <label htmlFor="displayName" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Display Name
                                    </label>
                                    <InputText id="displayName" value={displayName} onChange={(e) => SetDisplayName(e.target.value)} placeholder="Enter your display name" className="w-full text-base p-3" />
                                    <small className="text-gray-600 dark:text-gray-400 mt-1 block">This is how your name will appear to others</small>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Appearance Settings Card */}
                    <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <i className="pi pi-palette text-2xl text-purple-600 dark:text-purple-400"></i>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white my-0">Appearance</h2>
                            </div>

                            <div>
                                <label htmlFor="theme" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Theme Preference
                                </label>
                                <Dropdown
                                    id="theme"
                                    value={theme}
                                    options={themeOptions}
                                    onChange={(e) => SetTheme(e.value)}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select a theme"
                                    className="w-full"
                                    itemTemplate={(option) => (
                                        <div className="flex items-center gap-2">
                                            <i className={option.icon}></i>
                                            <span>{option.label}</span>
                                        </div>
                                    )}
                                    valueTemplate={(option) => {
                                        if (option) {
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <i className={option.icon}></i>
                                                    <span>{option.label}</span>
                                                </div>
                                            );
                                        }
                                        return <span>Select a theme</span>;
                                    }}
                                />
                                <small className="text-gray-600 dark:text-gray-400 mt-1 block">Choose how Olorin looks to you</small>
                            </div>

                            {/* Theme Preview */}
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <i className="pi pi-eye text-gray-600 dark:text-gray-300"></i>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Theme</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {theme === "light" && "Light mode - Bright and clear for daytime use"}
                                    {theme === "dark" && "Dark mode - Easy on the eyes in low light"}
                                    {theme === "system" && "System default - Automatically matches your device settings"}
                                </p>
                            </div>

                            <Divider />

                            {/* Color Scheme Selection */}
                            <div>
                                <label htmlFor="colorScheme" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Color Scheme
                                </label>
                                <Dropdown
                                    id="colorScheme"
                                    value={colorScheme}
                                    options={colorSchemeOptions}
                                    onChange={(e) => SetColorScheme(e.value)}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Select a color scheme"
                                    className="w-full"
                                    itemTemplate={(option) => (
                                        <div className="flex flex-col">
                                            <span className="font-medium">{option.label}</span>
                                            <small className="text-gray-600 dark:text-gray-400">{option.description}</small>
                                        </div>
                                    )}
                                    valueTemplate={(option) => {
                                        if (option) {
                                            return <span>{option.label}</span>;
                                        }
                                        return <span>Select a color scheme</span>;
                                    }}
                                />
                                <small className="text-gray-600 dark:text-gray-400 mt-1 block">Choose your preferred color palette inspired by Middle-earth</small>
                            </div>
                        </div>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                        <Button label="Save Changes" icon="pi pi-check" onClick={SaveMetadata} disabled={saving} loading={saving} className="bg-accent-600 hover:bg-accent-700 text-white border-accent-600 px-6 py-3 text-base" />
                    </div>
                </div>
            </div>
        </SessionAuth>
    );
}
