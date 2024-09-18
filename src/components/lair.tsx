import { StatBlock } from "@src/models/statBlock"
import "@src/styles/lair.scss"

export function LairDisplay({ name, lair }: { name: string, lair: StatBlock["Lair"] }) {
    if (!lair) return null;
    return (
        <div className="lair">
            <h4>{name}'s Lair</h4>
            <hr className="thin"/>
            {lair.Description} <br />
            {lair.Actions && <>
                <h5>Lair Actions</h5>
                <hr />
                {lair.Actions.Description} <br />
                {lair.Actions.Items.map((a, k) => <ul key={k}>
                    <li>{a}</li>
                </ul>)}
            </>}
            {lair.RegionalEffects && <>
                <h5>Regional Effects</h5>
                <hr />
                {lair.RegionalEffects.Description} <br />
                {lair.RegionalEffects.Items.map((a, k) => <ul key={k}>
                    <li>{a}</li>
                </ul>)}
            </>}
        </div>
    );
}