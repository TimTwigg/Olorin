import { createFileRoute, redirect } from "@tanstack/react-router"
import { AuthProviderProps } from "@src/controllers/auth"

export const Route = createFileRoute("/library")({
    beforeLoad: ({ context, location } : AuthProviderProps) => {
        if (!context.auth.isAuthenticated) {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href
                },
            })
        }
    },
    component: Library,
})

function Library() {
    return (
        <div>
            <p>
                This is the library.
            </p>
        </div>
    )
}
