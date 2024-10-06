import * as React from "react"
import { Entity } from "@src/models/entity"
import { Card } from "@src/components/card"
import { SmartMap } from "@src/models/smartMap"
import { UserOptions } from "@src/models/userOptions"

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
    GiDeathSkull,
} from "react-icons/gi"
import { FaSwimmer, FaAddressCard } from "react-icons/fa"
import { SlLockOpen } from "react-icons/sl"
import { AiFillLock } from "react-icons/ai"

type EntityDisplayProps = {
    entity: Entity,
    deleteCallback: () => void,
    expanded?: boolean,
    userOptions?: UserOptions,
    setDisplay?: (entity?: Entity) => void
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
    Display
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

function renderConditions(conditions: SmartMap<string, number>): JSX.Element {
    if (conditions.size === 0) return <></>;
    return (<div>
        <strong>Conditions:</strong> {conditions.map<string>((num, cond) => `${cond} (${num} round${num==1?'':'s'}) `)}<br />
    </div>)
}

export function EntityDisplay({ entity, deleteCallback, expanded, userOptions, setDisplay }: EntityDisplayProps) {
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
    const [Conditions, SetConditions] = React.useState<SmartMap<string, number>>(new SmartMap<string, number>());

    const ConditionTypes: string[] = userOptions?.conditions || [];

    setDisplay = setDisplay || ((entity?: Entity) => { console.log(`No display callback found for entity: ${entity?entity.Name:"undefined"}`) });

    const FlipExpandedState = () => {
        if (ExpandedState && ControlState !== ControlOptions.None) SetControlState(ControlOptions.None);
        SetExpandedState(!ExpandedState);
    }

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
            if (state === ControlOptions.Display) setDisplay(entity);
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
                case ControlOptions.Display:
                    setDisplay(entity);
                    break;
            }
            SetControlState(state);
        }
    }

    const LockEntity = (state: boolean) => {
        entity.setLock(state);
        SetLocked(state);
    }

    const UpdateConditions = (condition: string, state: boolean) => {
        let localConditions = Conditions;
        if (state) {
            localConditions.set(condition, 0);
        } else {
            localConditions.delete(condition);
        }
        SetConditions(localConditions);
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
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetInitiative(LocalNumericalState), entity.setInitiative(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    function renderHitpointsControl(): JSX.Element {
        return <>
            <span>
                <p>Hit Points</p>
                <button onClick={_ => { entity.damage(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetTempHitpoints(entity.TempHitPoints), SetControlState(ControlOptions.None) }} className="leftButton">-</button>
                <input type="number" min={0} placeholder="Adjust" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} />
                <button onClick={_ => { entity.heal(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton">+</button>
            </span>
            <span>
                <p>Temp Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState2(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetTempHitpoints(LocalNumericalState2), entity.addTempHP(LocalNumericalState2), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
            <span>
                <p>Max Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState3(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetMaxHitpoints(LocalNumericalState3), entity.setMaxHP(LocalNumericalState3), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
            <span><button onClick={_ => { SetTempHitpoints(0), SetCurrentHitpoints(0), entity.kill(), SetControlState(ControlOptions.None) }} className="icon">Kill<br /><GiDeathSkull /></button></span>
        </>
    }

    function renderACControl(): JSX.Element {
        return <>
            <span>
                <p>Armor Class</p>
                <input type="number" min={0} placeholder="Set" onChange={e => { SetLocalNumericalState(parseInt(e.target.value)) }} className="curveLeft" />
                <button onClick={_ => { SetAC(LocalNumericalState), entity.setAC(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    function renderConditionsControl(): JSX.Element {
        return <span className="conditionCheckBoxes">
            {ConditionTypes.map((condition, ind) => <section key={ind}><input type="checkbox" name={condition} id={condition} defaultChecked={Conditions.has(condition)} onChange={e => { UpdateConditions(condition, e.target.checked) }} /><label htmlFor={condition}>{condition}</label></section>)}
        </span>
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

    return (
        <div className="entity">
            <div className="displayCardInfo">
                <section>{Initiative}</section>
            </div>
            <div className="displayCard" onClick={FlipExpandedState}>
                {ExpandedState ?
                    <Card className="expanded" style={{ columnCount: 2 }}>
                        <h4 style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 2px" }}>{entity.IsHostile ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                        <strong>Hit Points:</strong> {CurrentHitpoints} {TempHitpoints > 0 ? ` (+${TempHitpoints})` : null} / {MaxHitpoints}<br />
                        <strong>Armor Class:</strong> {AC}<br />
                        {renderSpeed(entity.Speed)}
                        {renderConditions(Conditions)}
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
                <div className="controls">
                    <button onClick={_ => FlipControlState(ControlOptions.Settings)} title="Settings"><GiCog /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Initiative)} title="Initiative"><GiHourglass /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Hitpoints)} title="HitPoints"><GiHalfHeart /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.AC)} title="AC"><GiShield /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Conditions)} title="Conditions"><GiChalkOutlineMurder /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Spells)} title="Spells"><GiSpellBook /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Notes)} title="Notes"><GiPencil /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Display)} title="Display"><FaAddressCard /></button>
                </div>
                {(ControlState === ControlOptions.None || ControlState === ControlOptions.Display) ? null :
                    <div className="suboptions">
                        {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                        {ControlState === ControlOptions.Initiative ? renderInitiativeControl() : null}
                        {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                        {ControlState === ControlOptions.AC ? renderACControl() : null}
                        {ControlState === ControlOptions.Conditions ? renderConditionsControl() : null}
                        {ControlState === ControlOptions.Spells ? renderSpellsControl() : null}
                        {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                    </div>
                }
            </div>
        </div>
    );
}