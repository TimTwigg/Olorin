type CardProps = {
    children?: React.ReactNode;
}

export function Card({ children } : CardProps) {
    return (
        <section className = "card">
            {children}
        </section>
    );
}