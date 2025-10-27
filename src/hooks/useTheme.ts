import * as React from "react";
import { useRouteContext } from "@tanstack/react-router";

/**
 * Custom hook to manage theme (light/dark) and color scheme based on user preferences
 * Returns the effective theme (light or dark) based on user settings
 */
export function useTheme() {
    const context = useRouteContext({ from: "__root__" });
    const [effectiveTheme, setEffectiveTheme] = React.useState<"light" | "dark">("light");

    React.useEffect(() => {
        const updateTheme = () => {
            let isDark = false;

            // Get theme preference, defaulting to browser preference if not set
            const themePreference = context.userOptions?.theme;

            // Determine if dark mode should be enabled
            if (themePreference === "dark") {
                isDark = true;
            } else if (themePreference === "light") {
                isDark = false;
            } else {
                // "system" or undefined/null - use browser preference
                isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            }

            setEffectiveTheme(isDark ? "dark" : "light");

            // Update PrimeReact theme
            const themeLink = document.getElementById("theme-link");
            if (themeLink) {
                themeLink.setAttribute("href", isDark ? "primereact/resources/themes/bootstrap4-dark-blue/theme.css" : "primereact/resources/themes/bootstrap4-light-blue/theme.css");
            }

            // Update Tailwind dark mode
            if (isDark) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            // Update color scheme
            const colorScheme = context.userOptions?.colorScheme || "gandalf-grey";
            document.documentElement.setAttribute("data-color-scheme", colorScheme);
        };

        // Initial theme update
        updateTheme();

        // Listen for system preference changes when using "system" or no preference set
        const themePreference = context.userOptions?.theme;
        if (!themePreference || themePreference === "system") {
            const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => updateTheme();
            darkModeQuery.addEventListener("change", handler);
            return () => darkModeQuery.removeEventListener("change", handler);
        }
    }, [context.userOptions?.theme, context.userOptions?.colorScheme, context.loaded]);

    return effectiveTheme;
}
