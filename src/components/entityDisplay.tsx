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

function renderSpeed(speed: Entity["Speed"]): JSX.Element {
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
    const [LocalNumericalState, SetLocalNumericalState] = React.useState<number>(0);
    const [LocalNumericalState2, SetLocalNumericalState2] = React.useState<number>(0);
    const [LocalNumericalState3, SetLocalNumericalState3] = React.useState<number>(0);
    const [MaxHitpoints, SetMaxHitpoints] = React.useState<number>(entity.MaxHitPoints);
    const [CurrentHitpoints, SetCurrentHitpoints] = React.useState<number>(entity.CurrentHitPoints);
    const [TempHitpoints, SetTempHitpoints] = React.useState<number>(entity.TempHitPoints);
    const [AC, SetAC] = React.useState<number>(entity.ArmorClass);

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
        } else {
            switch (state) {
                case ControlOptions.Initiative:
                    SetLocalNumericalState(Initiative);
                    break;
                case ControlOptions.Hitpoints:
                    SetLocalNumericalState(0);
                    SetLocalNumericalState2(TempHitpoints);
                    SetLocalNumericalState3(MaxHitpoints);
                    break;
                case ControlOptions.AC:
                    SetLocalNumericalState(AC);
                    break;
            }
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
                <span><button onClick={_ => LockEntity(false)} className="icon"><AiFillLock /><br />Locked</button></span>
                :
                <span><button onClick={_ => LockEntity(true)} className="icon"><SlLockOpen /><br />Unlocked</button></span>
            }
            <span><button onClick={_ => { deleteCallback() }} disabled={Locked} className="icon"><GiTrashCan /><br />Delete</button></span>
        </>
    }

    function renderInitiativeControl(): JSX.Element {
        return <>
            <span>
                <p>Initiative</p>
                <input type="number" min={0} placeholder="Set Initiative" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetInitiative(LocalNumericalState), entity.setInitiative(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    function renderHitpointsControl(): JSX.Element {
        return <>
            <span>
                <p>Hit Points</p>
                <button onClick={_ => { entity.damage(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetTempHitpoints(entity.TempHitPoints), SetControlState(ControlOptions.None) }} className="leftButton">-</button>
                <input type="number" min={0} placeholder="Adjust HP" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} />
                <button onClick={_ => { entity.heal(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton">+</button>
            </span>
            <span>
                <p>Temp Hit Points</p>
                <input type="number" min={0} placeholder="Temp HP" onChange={e => SetLocalNumericalState2(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetTempHitpoints(LocalNumericalState2), entity.addTempHP(LocalNumericalState2), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
            <span>
                <p>Max Hit Points</p>
                <input type="number" min={0} placeholder="Set Max HP" onChange={e => SetLocalNumericalState3(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetMaxHitpoints(LocalNumericalState3), entity.setMaxHP(LocalNumericalState3), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    function renderACControl(): JSX.Element {
        return <>
            <span>
                <p>Armor Class</p>
                <input type="number" min={0} placeholder="Set AC" onChange={e => { SetLocalNumericalState(parseInt(e.target.value)) }} className="curveLeft" />
                <button onClick={_ => { SetAC(LocalNumericalState), entity.setAC(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    function renderConditionsControl(): JSX.Element {
        return <>
            Conditions - Not Implemented
        </>
    }

    function renderSpellsControl(): JSX.Element {
        return <>
            Spells - Not Implemented
        </>
    }

    function renderNotesControl(): JSX.Element {
        return <>
            Notes - Not Implemented
        </>
    }

    function renderStatBlockControl(): JSX.Element {
        return <>
            StatBlock - Not Implemented
        </>
    }

    return (
        <div className="entity">
            <div className="displayCard" onClick={_ => { SetExpandedState(!ExpandedState) }}>
                {ExpandedState ?
                    <Card className="expanded" style={{ columnCount: 2 }}>
                        <h4 style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 2px" }}>{entity.IsHostile ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                        <strong>Hit Points:</strong> {CurrentHitpoints} {TempHitpoints > 0 ? ` (+${TempHitpoints})` : null} / {MaxHitpoints}<br />
                        <strong>Armor Class:</strong> {AC}<br />
                        <strong>Initiative:</strong> {Initiative}<br />
                        {renderSpeed(entity.Speed)}
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4" style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 2px" }}>{entity.IsHostile ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</span>
                        <p>
                            <span><strong>HP:</strong> {CurrentHitpoints} {TempHitpoints > 0 ? ` (+${TempHitpoints})` : null} / {MaxHitpoints}</span>
                            <span><strong>AC:</strong> {AC}</span>
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