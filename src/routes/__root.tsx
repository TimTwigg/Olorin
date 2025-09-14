import React, { Suspense } from "react";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import { ModelContext } from "@src/models/modelContext";
import { OptionBox } from "@src/components/optionBox";
import * as api from "@src/controllers/api";
import "@src/styles/main.scss";
import "@src/styles/normalize.scss";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
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
    return (
        <nav>
            <h4>Olorin</h4>
            <section>
                <span>
                    <Link to="/">Home</Link>|<Link to="/encounters">Encounters</Link>|<Link to="/campaigns">Campaigns</Link>|<Link to="/library">Library</Link>|<Link to="/support">Support</Link>
                </span>
                <OptionBox />
            </section>
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
    const [types, sizes, conditions, campaigns] = await Promise.all([api.getTypes(), api.getSizes(), api.getConditions(), api.getCampaigns()]);
    context.creatureTypes = types.Types || [];
    context.creatureSizes = sizes.Sizes || [];
    context.conditions = conditions.Conditions || [];
    context.campaigns = campaigns.Campaigns || [];
};

export const Route = createRootRouteWithContext<ModelContext>()({
    loader: async ({ context }) => {
        loadContextData(context);
        return { context };
    },
    component: () => (
        <div className="pageDiv">
            <NavBar />
            <Outlet />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    ),
    errorComponent: ErrorComponent,
    notFoundComponent: NotFoundComponent,
});
