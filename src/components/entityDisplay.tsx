import { Entity } from "@src/models/entity"
import { Card } from "@src/components/card"
import HostileIcon from "@src/assets/crossedSwords.png"
import * as React from "react"

type EntityDisplayProps = {
    entity: Entity,
    expanded?: boolean
};

function renderSpeed(speed: Entity["StatBlock"]["Stats"]["Speed"]): string {
    return Object.entries(speed).map(([key, value]) => `${key}: ${value} ft`).join(", ");
}

export function EntityDisplay({ entity, expanded }: EntityDisplayProps) {
    const [ExpandedState, SetExpandedState] = React.useState(expanded);

    const dynamicStyle: React.CSSProperties = {
        columnCount: 2,
    };

    return (
        <div>
            <div className="displayCard entity" onClick={_ => { SetExpandedState(!ExpandedState) }}>
                {ExpandedState ?
                    <Card className="expanded" style={dynamicStyle}>
                        <h4>{entity.IsHostile ? <img src={HostileIcon} alt="Hostile" /> : null} {entity.Name}</h4>
                        <strong>Hit Points:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}<br />
                        <strong>Armor Class:</strong> {entity.StatBlock.Stats.ArmorClass}<br />
                        <strong>Initiative:</strong> {entity.Initiative}<br />
                        <strong>Speed:</strong> {renderSpeed(entity.StatBlock.Stats.Speed)}<br />
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4">{entity.IsHostile ? <img src={HostileIcon} alt="Hostile" /> : null} {entity.Name}</span>
                        <span><strong>HP:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}</span>
                        <span><strong>AC:</strong> {entity.StatBlock.Stats.ArmorClass}</span>
                    </Card>}
            </div>
            <div className="displayCardControls">
                
            </div>
        </div>
    );
}