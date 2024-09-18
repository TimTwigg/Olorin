import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export interface RouterContext {
    userID?: string,
    columnCount?: number,
}

export const router = createRouter({
    routeTree,
    context: {
        columnCount: 2,
    }
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}