import * as React from "react"

type CardProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Card(props : CardProps) {
    return (
        <section className = {"card"+(props.className?" "+props.className:"")} style={props.style}>
            {props.children}
        </section>
    );
}