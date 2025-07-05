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
import Session from "supertokens-auth-react/recipe/session";
import { SuperTokensWrapper } from "supertokens-auth-react";
import * as api from "@src/controllers/api";
import { ContentProps } from "primereact/dialog";

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
        EmailPassword.init({
            onHandleEvent: async (context) => {
                if (context.action === "SUCCESS") {
                    if (context.isNewRecipeUser && context.user.loginMethods.length === 1) {
                        if (context.user.emails.length > 0) {
                            api.setMetadata(new Map<string, string>([["email", context.user.emails[0]]]))
                        }
                    }
                }
            },
        }),
        ThirdPartyEmailPassword.init({
            signInAndUpFeature: {
                providers: [
                    Google.init(),
                ],
            },
            onHandleEvent: async (context) => {
                if (context.action === "SUCCESS") {
                    if (context.isNewRecipeUser && context.user.loginMethods.length === 1) {
                        if (context.user.emails.length > 0) {
                            api.setMetadata(new Map<string, string>([["email", context.user.emails[0]]]))
                        }
                    }
                }
            },
        }),
        Session.init(),
    ],
    style: `
        [data-supertokens~=container] {
            font-family: Open Sans, sans-serif;
        }
    `,
});

// Add DialogOptions type for ConfirmDialog
declare module "primereact/confirmdialog" {
    type DialogOptions = {
        visible: boolean,
        label?: string,
        message?: string,
        onHide: () => void,
        accept?: () => void,
        reject?: () => void,
        defaultFocus?: "accept" | "reject" | undefined,
        icon?: React.ReactNode,
        content?: (props: ContentProps) => React.ReactNode,
        footer?: React.ReactNode,
    };
}

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
