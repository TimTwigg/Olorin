import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/")({
    component: Index,
})

function Index() {
    return (
        <div>
            <h4>Welcome Home!</h4>
        </div>
    )
}
