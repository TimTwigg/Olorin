import { createRouter } from "@tanstack/react-router";
import { routeTree } from "@src/routeTree.gen";
import { UserOptions } from "@src/models/userOptions";

export const router = createRouter({
    routeTree,
    context: {
        userOptions: new UserOptions(),
        conditions: [],
        creatureTypes: [],
        campaigns: [],
        technicalConfig: {
            cacheSizes: {
                statblocks: 100,
            },
        },
    },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
