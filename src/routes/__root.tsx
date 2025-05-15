import React, { Suspense } from "react"
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router"
import { RouterContext } from "@src/router"
import "@src/styles/main.scss"
import "@src/styles/normalize.scss"

const TanStackRouterDevtools =
    process.env.NODE_ENV === "production"
        ? () => <></>
        : React.lazy(() =>
            import("@tanstack/router-devtools").then((res) => ({
                default: res.TanStackRouterDevtools
            })),
        )

type ErrorComponentProps = {
    error: any
    reset: () => void
}

const ErrorComponent = ({ error, reset }: ErrorComponentProps) => {
    return (
        <div className="errorComponent">
            <nav>
                <h4>Encounter Manager</h4>
                <span>
                    <Link to="/">
                        Home
                    </Link>
                    <Link to="/encounters">
                        Encounters
                    </Link>
                    <Link to="/library">
                        Library
                    </Link>
                </span>
            </nav>
            <span className = "errorBody">
                <h2>Something went wrong</h2>
                <pre><code>{error.message}</code></pre>
                <p>Please take a screenshot of this page and share with the developer via the contact page so that the error can be addressed.</p>
                <button onClick={reset}>Try again</button>
            </span>
        </div>
    )
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: () => (
        <div className="pageDiv">
            <nav>
                <h4>Encounter Manager</h4>
                <span>
                    <Link to="/">
                        Home
                    </Link>
                    <Link to="/encounters">
                        Encounters
                    </Link>
                    <Link to="/library">
                        Library
                    </Link>
                </span>
            </nav>
            <Outlet />
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </div>
    ),
    errorComponent: ErrorComponent,
})
