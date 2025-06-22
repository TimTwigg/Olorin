import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export interface RouterContext {
    columnCount?: number,
}

export const router = createRouter({
    routeTree,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}