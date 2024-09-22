import { Entity } from "@src/models/entity"
import { Card } from "@src/components/card"
import * as React from "react"

import {
    GiCrossedSwords,
    GiCog,
    GiHalfHeart,
    GiShield,
    GiChalkOutlineMurder,
    GiPencil,
    GiSpellBook,
    GiRun,
    GiMountainClimbing,
    GiDigDug,
    GiLibertyWing,
    GiHourglass,
    GiTrashCan,
    GiCheckMark,
} from "react-icons/gi"
import { FaSwimmer, FaAddressCard } from "react-icons/fa"
import { SlLockOpen } from "react-icons/sl"
import { AiFillLock } from "react-icons/ai"

type EntityDisplayProps = {
    entity: Entity,
    deleteCallback: () => void,
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

export function EntityDisplay({ entity, deleteCallback, expanded }: EntityDisplayProps) {
    const [ExpandedState, SetExpandedState] = React.useState<boolean>(expanded || false);
    const [ControlState, SetControlState] = React.useState<ControlOptions>(ControlOptions.None);
    const [Locked, SetLocked] = React.useState<boolean>(entity.EncounterLocked);
    const [Initiative, SetInitiative] = React.useState<number>(entity.Initiative);
    const [LocalInitState, SetLocalInitState] = React.useState<number>(Initiative);

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
        } else {
            SetControlState(state);
        }
    }

    const LockEntity = (state: boolean) => {
        entity.setLock(state);
        SetLocked(state);
    }

    function renderSettingsControl(): JSX.Element {
        return <>
            {Locked ?
                <button onClick={_ => LockEntity(false)}><AiFillLock /><br/>Locked</button>
                :
                <button onClick={_ => LockEntity(true)}><SlLockOpen /><br/>Unlocked</button>
            }
            <button onClick={_ => {deleteCallback()}} disabled={Locked}><GiTrashCan /><br/>Delete</button>
        </>
    }

    function renderInitiativeControl(): JSX.Element {
        return <>
            <input type="number" value={LocalInitState} onChange={e => SetLocalInitState(parseInt(e.target.value))} />
            <button onClick={_ => {SetInitiative(LocalInitState), entity.setInitiative(LocalInitState)}}><GiCheckMark /><br/></button>
        </>
    }

    function renderHitpointsControl(): JSX.Element {
        return <section>
            Hitpoints - Not Implemented
        </section>
    }

    function renderACControl(): JSX.Element {
        return <section>
            AC - Not Implemented
        </section>
    }

    function renderConditionsControl(): JSX.Element {
        return <section>
            Conditions - Not Implemented
        </section>
    }

    function renderSpellsControl(): JSX.Element {
        return <section>
            Spells - Not Implemented
        </section>
    }

    function renderNotesControl(): JSX.Element {
        return <section>
            Notes - Not Implemented
        </section>
    }

    function renderStatBlockControl(): JSX.Element {
        return <section>
            StatBlock - Not Implemented
        </section>
    }

    const dynamicStyle: React.CSSProperties = {
        columnCount: 2,
    };

    return (
        <div className="entity">
            <div className="displayCard" onClick={_ => { SetExpandedState(!ExpandedState) }}>
                {ExpandedState ?
                    <Card className="expanded" style={dynamicStyle}>
                        <h4>{entity.IsHostile ? <GiCrossedSwords /> : null} {entity.Name} {entity.EncounterLocked ? <AiFillLock id="titleLock"/> : null}</h4>
                        <strong>Hit Points:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}<br />
                        <strong>Armor Class:</strong> {entity.StatBlock.Stats.ArmorClass}<br />
                        <strong>Initiative:</strong> {Initiative}<br />
                        {renderSpeed(entity.StatBlock.Stats.Speed)}
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4">{entity.IsHostile ? <GiCrossedSwords /> : null} {entity.Name} {entity.EncounterLocked ? <AiFillLock id="titleLock"/> : null}</span>
                        <p>
                            <span><strong>HP:</strong> {entity.CurrentHitPoints} / {entity.StatBlock.Stats.HitPoints.Average}</span>
                            <span><strong>AC:</strong> {entity.StatBlock.Stats.ArmorClass}</span>
                        </p>
                    </Card>}
            </div>
            <div className="displayCardControls">
                <div id="controls">
                    <button onClick={_ => FlipControlState(ControlOptions.Settings)}><GiCog /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Initiative)}><GiHourglass /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Hitpoints)}><GiHalfHeart /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.AC)}><GiShield /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Conditions)}><GiChalkOutlineMurder /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Spells)}><GiSpellBook /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Notes)}><GiPencil /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.StatBlock)}><FaAddressCard /></button>
                </div>
                {ControlState === ControlOptions.None ? null :
                    <div id="suboptions">
                        {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                        {ControlState === ControlOptions.Initiative ? renderInitiativeControl() : null}
                        {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                        {ControlState === ControlOptions.AC ? renderACControl() : null}
                        {ControlState === ControlOptions.Conditions ? renderConditionsControl() : null}
                        {ControlState === ControlOptions.Spells ? renderSpellsControl() : null}
                        {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                        {ControlState === ControlOptions.StatBlock ? renderStatBlockControl() : null}
                    </div>
                }
            </div>
        </div>
    );
}