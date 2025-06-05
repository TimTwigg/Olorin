import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@src/router";

import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
import SuperTokens from "supertokens-auth-react";
import ThirdPartyEmailPassword, {
    Github,
    Google,
    Apple,
} from "supertokens-auth-react/recipe/thirdparty";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";
import { SuperTokensWrapper } from "supertokens-auth-react";

// Initialize SuperTokens
SuperTokens.init({
    appInfo: {
        appName: "Olorin",
        apiDomain: "http://localhost:8080",
        websiteDomain: "http://localhost:5173",
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    recipeList: [
        EmailPassword.init(),
        ThirdPartyEmailPassword.init({
            signInAndUpFeature: {
                providers: [
                    Github.init(),
                    Google.init(),
                    Apple.init(),
                ],
            },
        }),
        Session.init(),
    ],
});

// Render the app
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <>
            <StrictMode>
                {canHandleRoute([ThirdPartyPreBuiltUI, EmailPasswordPreBuiltUI]) ? (
                    getRoutingComponent([ThirdPartyPreBuiltUI, EmailPasswordPreBuiltUI])
                ) : (
                    <SuperTokensWrapper>
                        <RouterProvider router={router} />
                    </SuperTokensWrapper>
                )}
            </StrictMode>
        </>
    )
}
