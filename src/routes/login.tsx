import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
    component: Login
})

function Login() {
    return (
        <div>
            <h4>Login</h4>
        </div>
    )
}