import * as React from "react";
import { Entity } from "@src/models/entity";
import { Card } from "@src/components/card";
import { SmartMap } from "@src/models/data_structures/smartMap";
import { UserOptions } from "@src/models/userOptions";
import "@src/styles/entityDisplay.scss";

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
} from "react-icons/gi";
import { FaSwimmer, FaAddressCard } from "react-icons/fa";
import { SlLockOpen } from "react-icons/sl";
import { AiFillLock } from "react-icons/ai";
import { TbPencilOff, TbPencil } from "react-icons/tb";

type EntityDisplayProps = {
    ref?: React.RefObject<HTMLDivElement>;
    entity: Entity;
    deleteCallback: (id: string) => void;
    userOptions?: UserOptions;
    setDisplay?: (entity?: Entity) => void;
    renderTrigger?: () => void;
    overviewOnly?: boolean;
    editMode?: boolean;
    isActive?: boolean;
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
        <strong>Conditions:</strong> {conditions.map<string>((num, cond) => `${cond} (${num} round${num == 1 ? '' : 's'})`).join(", ")}<br />
    </div>)
}

export function EntityDisplay({ ref, entity, deleteCallback, userOptions, setDisplay, renderTrigger, overviewOnly, editMode, isActive }: EntityDisplayProps) {
    const [ExpandedState, SetExpandedState] = React.useState<boolean>(false);
    const [ControlState, SetControlState] = React.useState<ControlOptions>(ControlOptions.None);
    const [LocalNumericalState, SetLocalNumericalState] = React.useState<number>(0);
    const [LocalNumericalState2, SetLocalNumericalState2] = React.useState<number>(0);
    const [LocalNumericalState3, SetLocalNumericalState3] = React.useState<number>(0);
    const [LocalStringState, SetLocalStringState] = React.useState<string>("");
    const [readonly, SetReadonly] = React.useState<boolean>(false);

    const ConditionTypes: string[] = userOptions?.conditions || [];
    setDisplay = setDisplay || ((entity?: Entity) => { console.log(`No display callback found for entity: ${entity ? entity.Name : "undefined"}`) });
    renderTrigger = renderTrigger || (() => { console.log("No render trigger found") });

    const FlipExpandedState = () => {
        if (ExpandedState && ControlState !== ControlOptions.None) SetControlState(ControlOptions.None);
        if (!isActive) SetExpandedState(!ExpandedState);
    }

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
            if (state === ControlOptions.Display) setDisplay(entity);
        } else {
            switch (state) {
                case ControlOptions.Initiative:
                    SetLocalNumericalState(entity.Initiative);
                    break;
                case ControlOptions.Hitpoints:
                    SetLocalNumericalState(0);
                    SetLocalNumericalState2(entity.TempHitPoints);
                    SetLocalNumericalState3(entity.MaxHitPoints);
                    break;
                case ControlOptions.AC:
                    SetLocalNumericalState(0);
                    break;
                case ControlOptions.Display:
                    setDisplay(entity);
                    break;
                case ControlOptions.Notes:
                    SetLocalStringState(entity.Notes);
                    break;
            }
            SetControlState(state);
        }
    }

    const LockEntity = (state: boolean) => {
        entity.setLock(state);
    }

    const UpdateConditions = (condition: string, state: boolean) => {
        if (state) {
            entity.addCondition(condition);
        } else {
            entity.removeCondition(condition);
        }
    }

    const renderSettingsControl = () => {
        return <>
            <span><button onClick={_ => LockEntity(!entity.EncounterLocked)} className="icon">{entity.EncounterLocked ? <AiFillLock /> : <SlLockOpen />}<br />{entity.EncounterLocked ? "Locked" : "Unlocked"}</button></span>
            <span><button onClick={_ => SetReadonly(!readonly)} className="icon">{readonly ? <TbPencilOff /> : <TbPencil />}<br />{readonly ? "Read Only" : "Edit"}</button></span>
            <span><button onClick={_ => deleteCallback(entity.id)} disabled={entity.EncounterLocked || (!editMode && overviewOnly)} className="icon"><GiTrashCan /><br />Delete</button></span>
        </>
    }

    const renderInitiativeControl = () => {
        return <>
            <span>
                <p>Initiative</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} className="curveLeft" />
                <button onClick={_ => { entity.setInitiative(LocalNumericalState), SetControlState(ControlOptions.None), renderTrigger() }} className="rightButton"><GiCheckMark /></button>
            </span>
        </>
    }

    const renderHitpointsControl = () => {
        return <>
            <span>
                <p>Hit Points</p>
                <button onClick={_ => { entity.damage(LocalNumericalState), SetControlState(ControlOptions.None) }} className="leftButton" disabled={readonly}>-</button>
                <input type="number" min={0} placeholder="Adjust" onChange={e => SetLocalNumericalState(parseInt(e.target.value))} disabled={readonly} />
                <button onClick={_ => { entity.heal(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}>+</button>
            </span>
            <span>
                <p>Temp Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState2(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                <button onClick={_ => { entity.addTempHP(LocalNumericalState2), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}><GiCheckMark /></button>
            </span>
            <span>
                <p>Max Hit Points</p>
                <input type="number" min={0} placeholder="Set" onChange={e => SetLocalNumericalState3(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                <button onClick={_ => { entity.setMaxHP(LocalNumericalState3), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}><GiCheckMark /></button>
            </span>
            {!overviewOnly && <span><button onClick={_ => { entity.kill(), SetControlState(ControlOptions.None) }} className="icon" disabled={readonly}>Kill<br /><GiDeathSkull /></button></span>}
        </>
    }

    const renderACControl = () => {
        return <span>
            <p>Armor Class</p>
            <button onClick={_ => { entity.setACBonus(-LocalNumericalState), SetControlState(ControlOptions.None) }} className="leftButton" disabled={readonly}>-</button>
            <input type="number" min={0} placeholder="Set" onChange={e => { SetLocalNumericalState(parseInt(e.target.value)) }} disabled={readonly} />
            <button onClick={_ => { entity.setACBonus(LocalNumericalState), SetControlState(ControlOptions.None) }} className="rightButton" disabled={readonly}>+</button>
        </span>
    }

    const renderConditionsControl = () => {
        return <span className="conditionCheckBoxes">
            {ConditionTypes.map((condition, ind) => <section key={ind}><input type="checkbox" name={condition} id={condition} defaultChecked={entity.Conditions.has(condition)} onChange={e => { UpdateConditions(condition, e.target.checked), renderTrigger() }} disabled={readonly} /><label htmlFor={condition}>{condition}</label></section>)}
        </span>
    }

    const renderSpellsControl = () => {
        return <>
            Spells - Coming Soon...
        </>
    }

    const renderNotesControl = () => {
        return <>
            <textarea title="Notes" placeholder="Notes..." value={LocalStringState} onChange={e => SetLocalStringState(e.target.value)} disabled={readonly} />
            <span><button onClick={_ => { entity.setNotes(""), SetControlState(ControlOptions.None) }} disabled={readonly}>X</button></span>
            <span><button onClick={_ => { entity.setNotes(LocalStringState), SetControlState(ControlOptions.None) }} disabled={readonly}><GiCheckMark /></button></span>
        </>
    }

    if (overviewOnly) return (
        <div className="entity overview">
            <div className="displayCardInfo">
                <label>Initiative</label>
                {editMode ?
                    <input type="number" min={0} defaultValue={entity.Initiative === 0 ? undefined : entity.Initiative} onChange={e => { entity.setInitiative(parseInt(e.target.value)) }} />
                    :
                    <section>{entity.Initiative}</section>
                }
            </div>
            <div className="displayCard" style={{ columnCount: 2 }}>
                <h4 style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                <strong>Challenge Rating:</strong> {entity.DifficultyRating}<br />
                <strong>Hit Points:</strong> {entity.CurrentHitPoints < entity.MaxHitPoints ? ` ${entity.CurrentHitPoints} / ${entity.MaxHitPoints}` : entity.MaxHitPoints}<br />
                <strong>Armor Class:</strong> {entity.ArmorClass + entity.ArmorClassBonus}{entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}<br />
                {entity.Notes.length > 0 ? <><strong>Notes:</strong> {entity.Notes}<br /></> : null}
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
        <div className={"entity" + (isActive ? " active" : "")} ref={ref}>
            <div className="displayCardInfo">
                <section>{entity.Initiative}</section>
            </div>
            <div className="displayCard" onClick={FlipExpandedState}>
                {(ExpandedState || isActive) ?
                    <Card className="expanded" style={{ columnCount: 2 }}>
                        <h4 style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</h4>
                        <strong>Hit Points:</strong> {entity.CurrentHitPoints} {entity.TempHitPoints > 0 ? ` (+${entity.TempHitPoints})` : null} / {entity.MaxHitPoints}<br />
                        <strong>Armor Class:</strong> {entity.ArmorClass + entity.ArmorClassBonus}{entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}<br />
                        {renderSpeed(entity.Speed)}
                        <strong>Saves:</strong> DEX {entity.SavingThrows.Dexterity >= 0 ? "+" : ""}{entity.SavingThrows.Dexterity} WIS {entity.SavingThrows.Wisdom >= 0 ? "+" : ""}{entity.SavingThrows.Wisdom} CON {entity.SavingThrows.Constitution >= 0 ? "+" : ""}{entity.SavingThrows.Constitution}<br />
                        {entity.SpellSaveDC > 0 ? <><strong>Spell Save DC:</strong> {entity.SpellSaveDC}<br /></> : null}
                        {renderConditions(entity.Conditions)}
                        {entity.Notes.length > 0 ? <><strong>Notes:</strong> {entity.Notes}<br /></> : null}
                    </Card>
                    :
                    <Card className="collapsed">
                        <span className="h4" style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px" }}>{entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}{entity.Name}{entity.Suffix > "" ? ` (${entity.Suffix})` : ""}{entity.EncounterLocked ? <AiFillLock className="m-left" /> : null}</span>
                        <p>
                            <span><strong>HP:</strong> {entity.CurrentHitPoints} {entity.TempHitPoints > 0 ? ` (+${entity.TempHitPoints})` : null} / {entity.MaxHitPoints}</span>
                            <span><strong>AC:</strong> {entity.ArmorClass + entity.ArmorClassBonus}{entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}</span>
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