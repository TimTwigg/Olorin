import { createLazyFileRoute, Link } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

export const Route = createLazyFileRoute("/library/")({
    component: LibraryLanding,
});

function LibraryLanding() {
    const sections = [
        {
            to: "/library/custom-statblocks",
            title: "Custom Stat Blocks",
            description: "Create and manage your homebrew creatures and NPCs",
            icon: "pi-file-edit",
            color: "bg-blue-500",
        },
        {
            to: "/library/official-statblocks",
            title: "Official Stat Blocks",
            description: "Browse stat blocks from official sources",
            icon: "pi-bookmark",
            color: "bg-green-500",
        },
        {
            to: null,
            title: "Player Characters",
            description: "Manage your campaign's player characters",
            icon: "pi-user",
            color: "bg-purple-500",
            disabled: true,
        },
        {
            to: null,
            title: "NPCs",
            description: "Track important non-player characters",
            icon: "pi-user-plus",
            color: "bg-indigo-500",
            disabled: true,
        },
        {
            to: null,
            title: "Items",
            description: "Manage custom and official items",
            icon: "pi-box",
            color: "bg-yellow-500",
            disabled: true,
        },
        {
            to: null,
            title: "Spells",
            description: "Browse and create spells",
            icon: "pi-sparkles",
            color: "bg-pink-500",
            disabled: true,
        },
    ];

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen" style={{ fontSize: "16px" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Your Library</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Manage all your TTRPG content in one place</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((section, index) =>
                            section.disabled ? (
                                <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 ${section.color} rounded-lg`}>
                                            <i className={`pi ${section.icon} text-2xl text-white`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                {section.title}
                                                <span className="ml-2 text-sm text-gray-500">(Coming Soon)</span>
                                            </h3>
                                            <p className="text-base text-gray-600 dark:text-gray-400">{section.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link key={index} to={section.to!} className="p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg transition-all block">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 ${section.color} rounded-lg`}>
                                            <i className={`pi ${section.icon} text-2xl text-white`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h3>
                                            <p className="text-base text-gray-600 dark:text-gray-400">{section.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </SessionAuth>
    );
}
