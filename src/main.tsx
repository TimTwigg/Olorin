import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@src/router";

import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
import SuperTokens from "supertokens-auth-react";
import ThirdPartyEmailPassword, {
    Google,
} from "supertokens-auth-react/recipe/thirdparty";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
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
                    Google.init(),
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
                        <SessionAuth onSessionExpired={async () => {
                            await Session.signOut();
                            window.location.href = "/auth";
                        }}>
                            <RouterProvider router={router} />
                        </SessionAuth>
                    </SuperTokensWrapper>
                )}
            </StrictMode>
        </>
    )
}
