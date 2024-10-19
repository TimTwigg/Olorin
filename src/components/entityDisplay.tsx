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
import { TbPencilOff, TbPencil } from "react-icons/tb"

type EntityDisplayProps = {
    entity: Entity,
    deleteCallback: (id: string) => void,
    expanded?: boolean,
    userOptions?: UserOptions,
    setDisplay?: (entity?: Entity) => void,
    renderTrigger?: () => void,
    overviewOnly?: boolean
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
        <strong>Speed: </strong>
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
        <strong>Conditions:</strong> {conditions.map<string>((num, cond) => `${cond} (${num} round${num == 1 ? '' : 's'}) `)}<br />
    </div>)
}

export function EntityDisplay({ entity, deleteCallback, expanded, userOptions, setDisplay, renderTrigger, overviewOnly }: EntityDisplayProps) {
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
    const [ACBonus, SetACBonus] = React.useState<number>(entity.ArmorClassBonus);
    const [Conditions, SetConditions] = React.useState<SmartMap<string, number>>(new SmartMap<string, number>());
    const [readonly, SetReadonly] = React.useState<boolean>(false);

    const ConditionTypes: string[] = userOptions?.conditions || [];
    setDisplay = setDisplay || ((entity?: Entity) => { console.log(`No display callback found for entity: ${entity ? entity.Name : "undefined"}`) });
    renderTrigger = renderTrigger || (() => { console.log("No render trigger found") });

    // const ResetAllStates = () => {
    //     SetLocalNumericalState(0);
    //     SetLocalNumericalState2(0);
    //     SetLocalNumericalState3(0);
    //     SetMaxHitpoints(entity.MaxHitPoints);
    //     SetCurrentHitpoints(entity.CurrentHitPoints);
    //     SetTempHitpoints(entity.TempHitPoints);
    //     SetACBonus(entity.ArmorClassBonus);
    //     SetConditions(new SmartMap<string, number>());
    // }

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
                    SetLocalNumericalState(0);
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

    const renderSettingsControl = () => {
        return <>
            <span><button onClick={_ => LockEntity(!Locked)} className="icon">{Locked ? <AiFillLock /> : <SlLockOpen />}<br />{Locked ? "Locked" : "Unlocked"}</button></span>
            <span><button onClick={_ => SetReadonly(!readonly)} className="icon">{readonly ? <TbPencilOff /> : <TbPencil />}<br />{readonly ? "Read Only" : "Edit"}</button></span>
            <span><button onClick={_ => deleteCallback(entity.id)} disabled={Locked} className="icon"><GiTrashCan /><br />Delete</button></span>
        </>
    }

    const renderInitiativeControl = () => {
        return <>
            <span>
                <p>Initiative</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { SetInitiative(LocalNumericalState), entity.setInitiative(LocalNumericalState), SetControlState(ControlOptions.None), renderTrigger() }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    const renderHitpointsControl = () => {
        return <>
            <span>
                <p>Hit Points</p>
                <button onClick={_ => { entity.damage(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetTempHitpoints(entity.TempHitPoints), SetControlState(ControlOptions.None) }} className="leftButton" disabled={readonly}>-</button>
                <input type="number" min={0} placeholder="Adjust" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} disabled={readonly} />
                <button onClick={_ => { entity.heal(LocalNumericalState), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}>+</button>
            </span>
            <span>
                <p>Temp Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState2(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                <button onClick={_ => { SetTempHitpoints(LocalNumericalState2), entity.addTempHP(LocalNumericalState2), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}><GiCheckMark /></button>
            </span>
            <span>
                <p>Max Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState3(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                <button onClick={_ => { SetMaxHitpoints(LocalNumericalState3), entity.setMaxHP(LocalNumericalState3), SetCurrentHitpoints(entity.CurrentHitPoints), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}><GiCheckMark /></button>
            </span>
            {!overviewOnly && <span><button onClick={_ => { SetTempHitpoints(0), SetCurrentHitpoints(0), entity.kill(), SetControlState(ControlOptions.None) }} className="icon" disabled={readonly}>Kill<br /><GiDeathSkull /></button></span>}
        </>
    }

    const renderACControl = () => {
        return <>
            <span>
                <p>Armor Class</p>
                <button onClick={_ => { entity.setACBonus(-LocalNumericalState), SetACBonus(entity.ArmorClassBonus), SetControlState(ControlOptions.None) }} className="leftButton" disabled={readonly}>-</button>
                <input type="number" min={0} placeholder="Modify" onChange={e => { SetLocalNumericalState(parseInt(e.target.value)) }} disabled={readonly} />
                <button onClick={_ => { entity.setACBonus(LocalNumericalState), SetACBonus(entity.ArmorClassBonus), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}>+</button>
            </span>
        </>
    }

    const renderConditionsControl = () => {
        return <span className="conditionCheckBoxes">
            {ConditionTypes.map((condition, ind) => <section key={ind}><input type="checkbox" name={condition} id={condition} defaultChecked={Conditions.has(condition)} onChange={e => { UpdateConditions(condition, e.target.checked) }} disabled={readonly} /><label htmlFor={condition}>{condition}</label></section>)}
        </span>
    }

    const renderSpellsControl = () => {
        return <>
            Spells - Not Implemented
        </>
    }

    const renderNotesControl = () => {
        return <>
            Notes - Not Implemented
        </>
    }

    if (overviewOnly) return (
        <div className="entity overview">
            <div className="displayCardInfo">
                <label>Initiative</label>
                <input type="number" min={0} defaultValue={entity.Initiative === 0 ? undefined : entity.Initiative} onChange={e => { SetInitiative(parseInt(e.target.value)), entity.setInitiative(parseInt(e.target.value)) }} />
            </div>
            <div className="displayCard" style={{ columnCount: 2 }}>
                <h4 style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && CurrentHitpoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                <strong>Challenge Rating:</strong> {entity.DifficultyRating}<br />
                <strong>Hit Points:</strong> {CurrentHitpoints < MaxHitpoints?` ${CurrentHitpoints} / ${MaxHitpoints}`:MaxHitpoints}<br />
                <strong>Armor Class:</strong> {entity.ArmorClass + ACBonus}{ACBonus === 0 ? "" : ` (${entity.ArmorClass}${ACBonus > 0 ? "+" : ""}${ACBonus})`}<br />
            </div>
            <div className="displayCardControls">
                <div className="controls">
                    <button onClick={_ => FlipControlState(ControlOptions.Settings)} title="Settings"><GiCog /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Hitpoints)} title="HitPoints"><GiHalfHeart /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.AC)} title="AC"><GiShield /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Notes)} title="Notes"><GiPencil /></button>
                    <button onClick={_ => FlipControlState(ControlOptions.Display)} title="Display"><FaAddressCard /></button>
                </div>
                {(ControlState === ControlOptions.None || ControlState === ControlOptions.Display) ? null :
                    <div className="suboptions">
                        {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                        {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                        {ControlState === ControlOptions.AC ? renderACControl() : null}
                        {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                    </div>
                }
            </div>
        </div>
    );

    return (
        <div className="entity">
            <div className="displayCardInfo">
                <section>{Initiative}</section>
            </div>
            <div className="displayCard" onClick={FlipExpandedState}>
                {ExpandedState ?
                    <Card className="expanded" style={{ columnCount: 2 }}>
                        <h4 style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && CurrentHitpoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                        <strong>Hit Points:</strong> {CurrentHitpoints} {TempHitpoints > 0 ? ` (+${TempHitpoints})` : null} / {MaxHitpoints}<br />
                        <strong>Armor Class:</strong> {entity.ArmorClass + ACBonus}{ACBonus === 0 ? "" : ` (${entity.ArmorClass}${ACBonus > 0 ? "+" : ""}${ACBonus})`}<br />
                        {renderSpeed(entity.Speed)}
                        <strong>Saves:</strong> DEX {entity.SavingThrows.Dexterity >= 0 ? "+" : ""}{entity.SavingThrows.Dexterity} WIS {entity.SavingThrows.Wisdom >= 0 ? "+" : ""}{entity.SavingThrows.Wisdom} CON {entity.SavingThrows.Constitution >= 0 ? "+" : ""}{entity.SavingThrows.Constitution}<br />
                        {entity.SpellSaveDC > 0 ? <><strong>Spell Save DC:</strong> {entity.SpellSaveDC}<br /></> : null}
                        {renderConditions(Conditions)}
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4" style={{ textDecoration: CurrentHitpoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && CurrentHitpoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</span>
                        <p>
                            <span><strong>HP:</strong> {CurrentHitpoints} {TempHitpoints > 0 ? ` (+${TempHitpoints})` : null} / {MaxHitpoints}</span>
                            <span><strong>AC:</strong> {entity.ArmorClass + ACBonus}{ACBonus === 0 ? "" : ` (${entity.ArmorClass}${ACBonus > 0 ? "+" : ""}${ACBonus})`}</span>
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