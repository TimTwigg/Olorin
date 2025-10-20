import React, { Suspense } from "react";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import { ModelContext } from "@src/models/modelContext";
import { OptionBox } from "@src/components/optionBox";
import { useTheme } from "@src/hooks/useTheme";
import * as api from "@src/controllers/api";
import "@src/styles/main.scss";
import "@src/styles/normalize.scss";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "@src/styles/prime-react-overrides.scss";

const TanStackRouterDevtools =
    import.meta.env.VITE_USE_TANSTACK_ROUTER_TOOLS == "true" && import.meta.env.DEV
        ? React.lazy(() =>
              import("@tanstack/router-devtools").then((res) => ({
                  default: res.TanStackRouterDevtools,
              }))
          )
        : () => <></>;

type ErrorComponentProps = {
    error: any;
    reset: () => void;
};

const NavBar = () => {
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        return document.documentElement.classList.contains("dark");
    });

    const [colorScheme, setColorScheme] = React.useState(() => {
        return document.documentElement.getAttribute("data-color-scheme") || "gandalf-grey";
    });

    const toggleTheme = () => {
        const newIsDark = !isDarkMode;
        setIsDarkMode(newIsDark);

        // Update Tailwind dark mode
        if (newIsDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Update PrimeReact theme
        const themeLink = document.getElementById("theme-link");
        if (themeLink) {
            themeLink.setAttribute("href", newIsDark ? "primereact/resources/themes/bootstrap4-dark-blue/theme.css" : "primereact/resources/themes/bootstrap4-light-blue/theme.css");
        }
    };

    const changeColorScheme = (scheme: string) => {
        setColorScheme(scheme);
        document.documentElement.setAttribute("data-color-scheme", scheme);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm" style={{ fontSize: "16px" }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo/Brand + Theme Toggle */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                            <i className="pi pi-compass text-3xl text-accent-500 dark:text-accent-400"></i>
                            <span className="text-2xl font-bold">Olorin</span>
                        </Link>

                        {/* TEMP: Theme Toggle */}
                        <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Toggle light/dark mode (temporary)">
                            <i className={`pi ${isDarkMode ? "pi-sun" : "pi-moon"} text-base text-gray-700 dark:text-gray-300`}></i>
                            <span className="text-xs text-gray-600 dark:text-gray-400">TEMP</span>
                        </button>

                        {/* TEMP: Color Scheme Selector */}
                        <select
                            value={colorScheme}
                            onChange={(e) => changeColorScheme(e.target.value)}
                            className="px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            title="Select color scheme (temporary)"
                        >
                            <option value="gandalf-grey">Gandalf the Grey</option>
                            <option value="gandalf-white">Gandalf the White</option>
                            <option value="valinor">Valinor</option>
                            <option value="mithrandir">Mithrandir</option>
                        </select>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        <Link to="/" className="px-5 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link to="/encounters" className="px-5 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Encounters
                        </Link>
                        <Link to="/campaigns" className="px-5 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Campaigns
                        </Link>
                        <Link to="/library" className="px-5 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Library
                        </Link>
                        <Link to="/support" className="px-5 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Support
                        </Link>
                    </div>

                    {/* User Menu */}
                    <OptionBox />
                </div>
            </div>
        </nav>
    );
};

const ErrorComponent = ({ error, reset }: ErrorComponentProps) => {
    return (
        <div className="errorComponent">
            <NavBar />
            <span className="errorBody">
                <h2>Something went wrong</h2>
                <pre>
                    <code>{error.message}</code>
                </pre>
                <p>Please take a screenshot of this page and share with the developers via the contact page so that the error can be addressed.</p>
                <button onClick={reset}>Try again</button>
            </span>
        </div>
    );
};

const NotFoundComponent = () => {
    return (
        <div>
            <h1>404 - Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
};

const loadContextData = async (context: ModelContext) => {
    // Load public data (doesn't require authentication)
    try {
        const [types, sizes, conditions] = await Promise.all([api.getTypes(), api.getSizes(), api.getConditions()]);
        context.creatureTypes = types.Types || [];
        context.creatureSizes = sizes.Sizes || [];
        context.conditions = conditions.Conditions || [];
    } catch (error) {
        console.error("Error loading public data:", error);
    }

    // Load user-specific data (requires authentication)
    try {
        const campaigns = await api.getCampaigns(1);
        context.campaigns = campaigns.Campaigns || [];
    } catch (error) {
        // User not authenticated - use empty array
        context.campaigns = [];
    }

    // Load theme and color scheme from metadata (requires authentication)
    try {
        const metadata = await api.getMetadata();
        if (metadata.Metadata.has("theme")) {
            const themeValue = metadata.Metadata.get("theme");
            if (themeValue === "light" || themeValue === "dark" || themeValue === "system") {
                context.userOptions.theme = themeValue;
            }
        }
        if (metadata.Metadata.has("colorScheme")) {
            const colorSchemeValue = metadata.Metadata.get("colorScheme");
            if (colorSchemeValue === "gandalf-grey" || colorSchemeValue === "gandalf-white" || colorSchemeValue === "valinor" || colorSchemeValue === "mithrandir") {
                context.userOptions.colorScheme = colorSchemeValue;
            }
        }
    } catch (error) {
        // User not authenticated or metadata not available - use defaults
        console.log("Theme/color scheme not loaded from metadata, using defaults");
    }

    context.loaded = true;
};

function RootComponent() {
    useTheme(); // Apply theme globally (called for side effects)

    return (
        <div className="pageDiv">
            <NavBar />
            <Outlet />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export const Route = createRootRouteWithContext<ModelContext>()({
    loader: async ({ context }) => {
        await loadContextData(context);
        return { context };
    },
    component: RootComponent,
    errorComponent: ErrorComponent,
    notFoundComponent: NotFoundComponent,
});
