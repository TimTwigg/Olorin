import * as React from "react";
import { useRouteContext } from "@tanstack/react-router";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";

import { GiCrossedSwords, GiCog, GiHalfHeart, GiShield, GiChalkOutlineMurder, GiPencil, GiSpellBook, GiRun, GiMountainClimbing, GiDigDug, GiLibertyWing, GiHourglass, GiTrashCan, GiDeathSkull } from "react-icons/gi";
import { FaSwimmer, FaAddressCard } from "react-icons/fa";
import { SlLockOpen } from "react-icons/sl";
import { AiFillLock } from "react-icons/ai";
import { TbPencilOff, TbPencil } from "react-icons/tb";

import { Entity } from "@src/models/entity";
import { Card } from "@src/components/card";
import { SmartMap } from "@src/models/data_structures/smartMap";
import { StatBlock } from "@src/models/statBlock";
import "@src/styles/entityDisplay.scss";

type EntityDisplayProps = {
    ref?: React.RefObject<HTMLDivElement>;
    entity: Entity;
    deleteCallback: (id: string) => void;
    setDisplay?: (statblock?: StatBlock) => void;
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
    Display,
}

function renderSpeed(speed: Entity["Speed"]): JSX.Element {
    return (
        <div>
            <strong>Speed: </strong>
            {speed.Walk !== 0 && (
                <span>
                    <GiRun /> {speed.Walk} ft.
                </span>
            )}
            {speed.Fly !== 0 && (
                <span>
                    <GiLibertyWing /> {speed.Fly} ft.
                </span>
            )}
            {speed.Climb !== 0 && (
                <span>
                    <GiMountainClimbing /> {speed.Climb} ft.
                </span>
            )}
            {speed.Swim !== 0 && (
                <span>
                    <FaSwimmer /> {speed.Swim} ft.
                </span>
            )}
            {speed.Burrow !== 0 && (
                <span>
                    <GiDigDug /> {speed.Burrow} ft.
                </span>
            )}
        </div>
    );
}

function renderConditions(conditions: SmartMap<string, number>): JSX.Element {
    if (conditions.size === 0) return <></>;
    return (
        <div>
            <strong>Conditions:</strong> {conditions.map<string>((num, cond) => `${cond} (${num} round${num == 1 ? "" : "s"})`).join(", ")}
            <br />
        </div>
    );
}

export function EntityDisplay({ ref, entity, deleteCallback, setDisplay, renderTrigger, overviewOnly, editMode, isActive }: EntityDisplayProps) {
    const context = useRouteContext({ from: "__root__" });

    if (!entity || !entity.Name) {
        console.log(entity);

        return <div className="entity">Error: No entity provided</div>;
    }

    const [ExpandedState, SetExpandedState] = React.useState<boolean>(false);
    const [ControlState, SetControlState] = React.useState<ControlOptions>(ControlOptions.None);
    const [LocalNumericalState, SetLocalNumericalState] = React.useState<number>(0);
    const [LocalNumericalState2, SetLocalNumericalState2] = React.useState<number>(0);
    const [LocalNumericalState3, SetLocalNumericalState3] = React.useState<number>(0);
    const [LocalStringState, SetLocalStringState] = React.useState<string>("");
    const [readonly, SetReadonly] = React.useState<boolean>(false);
    const [locked, SetLocked] = React.useState<boolean>(false);

    setDisplay =
        setDisplay ||
        ((_: any) => {
            console.log(`No display callback found for entity: ${entity ? entity.Name : "undefined"}`);
        });
    renderTrigger =
        renderTrigger ||
        (() => {
            console.log("No render trigger found");
        });

    const FlipExpandedState = () => {
        if (ExpandedState && ControlState !== ControlOptions.None) SetControlState(ControlOptions.None);
        if (!isActive) SetExpandedState(!ExpandedState);
    };

    const FlipControlState = (state: ControlOptions) => {
        if (ControlState === state) {
            SetControlState(ControlOptions.None);
            if (state === ControlOptions.Display) setDisplay(entity.Displayable);
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
                    setDisplay(entity.Displayable);
                    break;
                case ControlOptions.Notes:
                    SetLocalStringState(entity.Notes);
                    break;
            }
            SetControlState(state);
        }
    };

    const LockEntity = (state: boolean) => {
        SetLocked(state);
        entity.setLock(state);
    };

    const UpdateConditions = (condition: string, state: boolean) => {
        if (state) {
            entity.addCondition(condition);
        } else {
            entity.removeCondition(condition);
        }
    };

    const renderSettingsControl = () => {
        return (
            <>
                <Button icon={locked ? <AiFillLock /> : <SlLockOpen />} severity={locked ? "info" : "secondary"} outlined label={locked ? "Locked" : "Unlocked"} onClick={(_) => LockEntity(!locked)} className="rounded" />
                <Button icon={readonly ? <TbPencilOff /> : <TbPencil />} severity={readonly ? "secondary" : undefined} outlined label={readonly ? "Read Only" : "Edit"} onClick={(_) => SetReadonly(!readonly)} className="rounded" />
                <Button icon={<GiTrashCan />} severity="danger" outlined label="Delete" onClick={(_) => deleteCallback(entity.ID)} disabled={locked || (!editMode && overviewOnly) || readonly} className="rounded" />
            </>
        );
    };

    const renderInitiativeControl = () => {
        return (
            <>
                <span>
                    <input type="number" min={0} placeholder="Set" onChange={(e) => SetLocalNumericalState(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                    <Button
                        icon="pi pi-check"
                        text
                        severity="success"
                        onClick={(_) => {
                            entity.setInitiative(LocalNumericalState), SetControlState(ControlOptions.None), renderTrigger();
                        }}
                        className="rightButton"
                        disabled={readonly}
                    />
                </span>
            </>
        );
    };

    const renderHitpointsControl = () => {
        return (
            <>
                <span>
                    <Button
                        icon="pi pi-minus"
                        text
                        className="leftButton"
                        severity="danger"
                        onClick={(_) => {
                            entity.damage(LocalNumericalState), SetControlState(ControlOptions.None);
                        }}
                        disabled={readonly}
                    />
                    <input type="number" min={0} placeholder="HP" onChange={(e) => SetLocalNumericalState(parseInt(e.target.value))} disabled={readonly} />
                    <Button
                        icon="pi pi-plus"
                        text
                        className="rightButton"
                        severity="success"
                        onClick={(_) => {
                            entity.heal(LocalNumericalState), SetControlState(ControlOptions.None);
                        }}
                        disabled={readonly}
                    />
                </span>
                <span>
                    <input type="number" min={0} placeholder="Temp HP" onChange={(e) => SetLocalNumericalState2(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                    <Button
                        icon="pi pi-check"
                        text
                        severity="success"
                        onClick={(_) => {
                            entity.addTempHP(LocalNumericalState2), SetControlState(ControlOptions.None);
                        }}
                        className="rightButton"
                        disabled={readonly}
                    />
                </span>
                <span>
                    <input type="number" min={0} placeholder="Max HP" onChange={(e) => SetLocalNumericalState3(parseInt(e.target.value))} className="curveLeft" disabled={readonly} />
                    <Button
                        icon="pi pi-check"
                        text
                        severity="success"
                        onClick={(_) => {
                            entity.setMaxHP(LocalNumericalState3), SetControlState(ControlOptions.None);
                        }}
                        className="rightButton"
                        disabled={readonly}
                    />
                </span>
                {!overviewOnly && (
                    <span>
                        <Button
                            severity="danger"
                            icon={<GiDeathSkull />}
                            text
                            onClick={(_) => {
                                entity.kill(), SetControlState(ControlOptions.None);
                            }}
                            className="rounded"
                            disabled={readonly}
                        />
                    </span>
                )}
            </>
        );
    };

    const renderACControl = () => {
        return (
            <span>
                <Button
                    icon="pi pi-minus"
                    text
                    severity="danger"
                    onClick={(_) => {
                        entity.setACBonus(-LocalNumericalState), SetControlState(ControlOptions.None);
                    }}
                    className="leftButton"
                    disabled={readonly}
                />
                <input
                    type="number"
                    min={0}
                    placeholder="AC Bonus"
                    onChange={(e) => {
                        SetLocalNumericalState(parseInt(e.target.value));
                    }}
                    disabled={readonly}
                    className="wide"
                />
                <Button
                    icon="pi pi-plus"
                    text
                    severity="success"
                    onClick={(_) => {
                        entity.setACBonus(LocalNumericalState), SetControlState(ControlOptions.None);
                    }}
                    className="rightButton"
                    disabled={readonly}
                />
            </span>
        );
    };

    const renderConditionsControl = () => {
        return (
            <span className="conditionCheckBoxes">
                {context.conditions.map((condition, ind) => (
                    <section key={ind}>
                        <label>
                            <Checkbox
                                inputId={`${entity.ID}_${condition.Name}`}
                                checked={entity.Conditions.has(condition.Name)}
                                onChange={(e) => {
                                    UpdateConditions(condition.Name, e.checked || false), renderTrigger();
                                }}
                                disabled={readonly}
                                variant="filled"
                            />
                            {condition.Name}
                        </label>
                    </section>
                ))}
            </span>
        );
    };

    const renderSpellsControl = () => {
        return (
            <span className="spellsControl">
                <label htmlFor={`${entity.ID}_Concentration`}>
                    <Checkbox
                        inputId={`${entity.ID}_Concentration`}
                        checked={entity.Concentration}
                        onChange={(e) => {
                            entity.setConcentration(e.checked || false), renderTrigger();
                        }}
                        disabled={readonly}
                        variant="filled"
                    />
                    Concentration
                </label>
            </span>
        );
    };

    const renderNotesControl = () => {
        return (
            <span className="notesControl">
                <InputTextarea title="Notes" placeholder="Notes..." value={LocalStringState} onChange={(e) => SetLocalStringState(e.target.value)} disabled={readonly} />
                <span className="justify-between">
                    <Button
                        icon="pi pi-times"
                        label="Remove"
                        outlined
                        onClick={(_) => {
                            entity.setNotes(""), SetControlState(ControlOptions.None);
                        }}
                        disabled={readonly}
                        severity="danger"
                        className="rounded"
                    />
                    <Button
                        icon="pi pi-check"
                        label="Save"
                        outlined
                        onClick={(_) => {
                            entity.setNotes(LocalStringState), SetControlState(ControlOptions.None);
                        }}
                        disabled={readonly}
                        severity="success"
                        className="rounded"
                    />
                </span>
            </span>
        );
    };

    if (overviewOnly)
        return (
            <div className="entity overview">
                <div className="displayCardInfo">
                    {!editMode ? (
                        <section>{entity.Initiative}</section>
                    ) : (
                        <input
                            type="number"
                            min={0}
                            defaultValue={entity.Initiative === 0 ? undefined : entity.Initiative}
                            onChange={(e) => {
                                entity.setInitiative(parseInt(e.target.value)) ?? 0;
                            }}
                        />
                    )}
                </div>
                <div className="displayCard" style={{ columnCount: 3 }}>
                    <h4 style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px", columnSpan: "all" }}>
                        {entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}
                        {entity.Name}
                        {entity.Suffix > "" ? ` (${entity.Suffix})` : ""}
                        {locked ? <AiFillLock className="m-left" /> : null}
                    </h4>
                    <section>
                        <strong>CR:</strong> {entity.ChallengeRating}
                    </section>
                    <section>
                        <strong>HP:</strong> {entity.CurrentHitPoints < entity.MaxHitPoints ? entity.CurrentHitPoints : entity.MaxHitPoints}
                    </section>
                    <section>
                        <strong>AC:</strong> {entity.ArmorClass + entity.ArmorClassBonus}
                        {entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}
                    </section>
                    {entity.Notes.length > 0 ? (
                        <section style={{ columnSpan: "all" }}>
                            <strong>Notes:</strong> {entity.Notes}
                            <br />
                        </section>
                    ) : null}
                </div>
                {editMode && (
                    <div className="displayCardControls">
                        <div className="controls">
                            <Button icon={<GiCog />} severity="secondary" outlined onClick={(_) => FlipControlState(ControlOptions.Settings)} disabled={readonly} />
                            <Button icon={<GiHalfHeart />} severity="success" outlined onClick={(_) => FlipControlState(ControlOptions.Hitpoints)} disabled={readonly} />
                            <Button icon={<GiShield />} severity="info" outlined onClick={(_) => FlipControlState(ControlOptions.AC)} disabled={readonly} />
                            <Button icon={<GiChalkOutlineMurder />} severity="warning" outlined onClick={(_) => FlipControlState(ControlOptions.Conditions)} disabled={readonly} />
                            <Button icon={<GiPencil />} outlined onClick={(_) => FlipControlState(ControlOptions.Notes)} disabled={readonly} />
                            <Button icon={<FaAddressCard />} severity="help" outlined onClick={(_) => FlipControlState(ControlOptions.Display)} disabled={readonly} />
                        </div>
                        {ControlState === ControlOptions.None || ControlState === ControlOptions.Display ? null : (
                            <div className="suboptions narrow">
                                {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                                {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                                {ControlState === ControlOptions.AC ? renderACControl() : null}
                                {ControlState === ControlOptions.Conditions ? renderConditionsControl() : null}
                                {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );

    return (
        <div className={"entity" + (isActive ? " active" : "")} ref={ref}>
            <div className="displayCardInfo">
                <section>{entity.Initiative}</section>
            </div>
            <div className="displayCard" onClick={FlipExpandedState}>
                {ExpandedState || isActive ? (
                    <Card className="expanded" style={{ columnCount: 2 }}>
                        <h4 style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px" }}>
                            {entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}
                            {entity.Name}
                            {entity.Suffix > "" ? ` (${entity.Suffix})` : ""}
                            {locked ? <AiFillLock className="m-left" /> : null}
                        </h4>
                        {entity.Concentration && (
                            <section className="activeConcentration">
                                <b>C</b>
                            </section>
                        )}
                        <strong>Hit Points:</strong> {entity.CurrentHitPoints} {entity.TempHitPoints > 0 ? ` (+${entity.TempHitPoints})` : null} / {entity.MaxHitPoints}
                        <br />
                        <strong>Armor Class:</strong> {entity.ArmorClass + entity.ArmorClassBonus}
                        {entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}
                        <br />
                        {renderSpeed(entity.Speed)}
                        <strong>Saves:</strong> DEX {entity.SavingThrows.get("Dexterity")! >= 0 ? "+" : ""}
                        {entity.SavingThrows.get("Dexterity")} WIS {entity.SavingThrows.get("Wisdom")! >= 0 ? "+" : ""}
                        {entity.SavingThrows.get("Wisdom")} CON {entity.SavingThrows.get("Constitution")! >= 0 ? "+" : ""}
                        {entity.SavingThrows.get("Constitution")}
                        <br />
                        {entity.SpellSaveDC > 0 ? (
                            <>
                                <strong>Spell Save DC:</strong> {entity.SpellSaveDC}
                                <br />
                            </>
                        ) : null}
                        {renderConditions(entity.Conditions)}
                        {entity.Notes.length > 0 ? (
                            <>
                                <strong>Notes:</strong> {entity.Notes}
                                <br />
                            </>
                        ) : null}
                    </Card>
                ) : (
                    <Card className="collapsed">
                        <span className="h4" style={{ textDecoration: entity.CurrentHitPoints > 0 ? "" : "line-through 3px" }}>
                            {entity.IsHostile && entity.CurrentHitPoints > 0 ? <GiCrossedSwords className="m-right" /> : null}
                            {entity.Name}
                            {entity.Suffix > "" ? ` (${entity.Suffix})` : ""}
                            {locked ? <AiFillLock className="m-left" /> : null}
                        </span>
                        {entity.Concentration && (
                            <section>
                                <b>C</b>
                            </section>
                        )}
                        <p>
                            <span>
                                <strong>HP:</strong> {entity.CurrentHitPoints} {entity.TempHitPoints > 0 ? ` (+${entity.TempHitPoints})` : null} / {entity.MaxHitPoints}
                            </span>
                            <span>
                                <strong>AC:</strong> {entity.ArmorClass + entity.ArmorClassBonus}
                                {entity.ArmorClassBonus === 0 ? "" : ` (${entity.ArmorClass}${entity.ArmorClassBonus > 0 ? "+" : ""}${entity.ArmorClassBonus})`}
                            </span>
                        </p>
                    </Card>
                )}
            </div>
            <div className="displayCardControls">
                <div className="controls">
                    <Button icon={<GiCog />} severity="secondary" outlined onClick={(_) => FlipControlState(ControlOptions.Settings)} disabled={readonly} />
                    <Button icon={<GiHourglass />} outlined onClick={(_) => FlipControlState(ControlOptions.Initiative)} disabled={readonly} />
                    <Button icon={<GiHalfHeart />} severity="success" outlined onClick={(_) => FlipControlState(ControlOptions.Hitpoints)} disabled={readonly} />
                    <Button icon={<GiShield />} severity="info" outlined onClick={(_) => FlipControlState(ControlOptions.AC)} disabled={readonly} />
                    <Button icon={<GiChalkOutlineMurder />} severity="warning" outlined onClick={(_) => FlipControlState(ControlOptions.Conditions)} disabled={readonly} />
                    <Button icon={<GiSpellBook />} severity="danger" outlined onClick={(_) => FlipControlState(ControlOptions.Spells)} disabled={readonly} />
                    <Button icon={<GiPencil />} outlined onClick={(_) => FlipControlState(ControlOptions.Notes)} disabled={readonly} />
                    <Button icon={<FaAddressCard />} severity="help" outlined onClick={(_) => FlipControlState(ControlOptions.Display)} disabled={readonly} />
                </div>
                {ControlState === ControlOptions.None || ControlState === ControlOptions.Display ? null : (
                    <div className="suboptions">
                        {ControlState === ControlOptions.Settings ? renderSettingsControl() : null}
                        {ControlState === ControlOptions.Initiative ? renderInitiativeControl() : null}
                        {ControlState === ControlOptions.Hitpoints ? renderHitpointsControl() : null}
                        {ControlState === ControlOptions.AC ? renderACControl() : null}
                        {ControlState === ControlOptions.Conditions ? renderConditionsControl() : null}
                        {ControlState === ControlOptions.Spells ? renderSpellsControl() : null}
                        {ControlState === ControlOptions.Notes ? renderNotesControl() : null}
                    </div>
                )}
            </div>
        </div>
    );
}
