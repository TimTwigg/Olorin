import { Entity } from "@src/models/entity"
import { Card } from "@src/components/card"
import * as React from "react"

import { GiCrossedSwords, GiCog, GiHalfHeart, GiShield, GiChalkOutlineMurder, GiPencil, GiSpellBook, GiRun, GiMountainClimbing, GiDigDug, GiLibertyWing } from "react-icons/gi"
import { FaSwimmer, FaAddressCard } from "react-icons/fa"
import { IoMdHourglass } from "react-icons/io"

type EntityDisplayProps = {
    entity: Entity,
    expanded?: boolean
};

enum ControlOptions {
    None,
    Settings,
    Initiative,
    Hitpoints,
    AC,
    Conditions,
    Spells,
    Notes,
    StatBlock
}

function renderSpeed(speed: Entity["StatBlock"]["Stats"]["Speed"]): JSX.Element {
    return <div>
        <strong>Speed:</strong><br />
        {speed.Walk && <span><GiRun /> {speed.Walk} ft.</span>}
        {speed.Fly && <span><GiLibertyWing /> {speed.Fly} ft.</span>}
        {speed.Climb && <span><GiMountainClimbing /> {speed.Climb} ft.</span>}
        {speed.Swim && <span><FaSwimmer /> {speed.Swim} ft.</span>}
        {speed.Burrow && <span><GiDigDug /> {speed.Burrow} ft.</span>}
    </div>
}

function renderSettingsControl(): JSX.Element {
    return <div>
        Settings - Not Implemented
    </div>
}

function renderInitiativeControl(): JSX.Element {
    return <div>
        Initiative - Not Implemented
    </div>
}

function renderHitpointsControl(): JSX.Element {
    return <div>
        Hitpoints - Not Implemented
    </div>
}

function renderACControl(): JSX.Element {
    return <div>
        AC - Not Implemented
    </div>
}

function renderConditionsControl(): JSX.Element {
    return <div>
        Conditions - Not Implemented
    </div>
}

function renderSpellsControl(): JSX.Element {
    return <div>
        Spells - Not Implemented
    </div>
}

function renderNotesControl(): JSX.Element {
    return <div>
        Notes - Not Implemented
    </div>
}

function renderStatBlockControl(): JSX.Element {
    return <div>
        StatBlock - Not Implemented
    </div>
}

export function EntityDisplay({ entity, expanded }: EntityDisplayProps) {
    const [ExpandedState, SetExpandedState] = React.useState<boolean>(expanded || false);
    const [ControlState, SetControlState] = React.useState<ControlOptions>(ControlOptions.None);

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
        } else {
            SetControlState(state);
        }
    }

    const dynamicStyle: React.CSSProperties = {
        columnCount: 2,
    };

    return (
        <div className="entity">
            <div className="displayCard" onClick={_ => { SetExpandedState(!ExpandedState) }}>
                {ExpandedState ?
                    <Card className="expanded" style={dynamicStyle}>
                        <h4>{entity.IsHostile ? <GiCrossedSwords /> : null} {entity.Name}</h4>
                        <strong>Hit Points:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}<br />
                        <strong>Armor Class:</strong> {entity.StatBlock.Stats.ArmorClass}<br />
                        <strong>Initiative:</strong> {entity.Initiative}<br />
                        {renderSpeed(entity.StatBlock.Stats.Speed)}
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4">{entity.IsHostile ? <GiCrossedSwords /> : null} {entity.Name}</span>
                        <p>
                            <span><strong>HP:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}</span>
                            <span><strong>AC:</strong> {entity.StatBlock.Stats.ArmorClass}</span>
                        </p>
                    </Card>}
            </div>
            <div className="displayCardControls">
                <div className="space-evenly">
                    <button onClick={_ => FlipControlState(ControlOptions.Settings)}><GiCog /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Initiative)}><IoMdHourglass /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Hitpoints)}><GiHalfHeart /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.AC)}><GiShield /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Conditions)}><GiChalkOutlineMurder /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Spells)}><GiSpellBook /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Notes)}><GiPencil /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.StatBlock)}><FaAddressCard /></button>
                </div>
                {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                {ControlState === ControlOptions.Initiative ? renderInitiativeControl() : null}
                {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                {ControlState === ControlOptions.AC ? renderACControl() : null}
                {ControlState === ControlOptions.Conditions ? renderConditionsControl() : null}
                {ControlState === ControlOptions.Spells ? renderSpellsControl() : null}
                {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                {ControlState === ControlOptions.StatBlock ? renderStatBlockControl() : null}
            </div>
        </div>
    );
}