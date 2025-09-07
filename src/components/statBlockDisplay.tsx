import { StatBlock } from "@src/models/statBlock"
import { Card } from "@src/components/card"
import { modifierOf } from "@src/controllers/utils"

function StatDisplay({ name, value }: { name: string, value: number }) {
    const modifier = modifierOf(value);
    return (
        <span className="statdisplay">
            <strong>{name}</strong> <br />
            {value} ({modifier < 0 ? "" : "+"}{modifier})
        </span>
    );
}

function ActionsDisplay({ actions }: { actions: StatBlock["Actions"] }) {
    return (
        <>
            {actions.map((a, k) => <section key={k}>
                <strong>{a.Name} </strong>
                {a.AttackType && <i>{a.AttackType}: </i>}
                {a.ToHitModifier && <>{a.ToHitModifier > 0 ? "+" : ""}{a.ToHitModifier} to hit, {a.AttackType?.startsWith("Melee") ? "reach" : "range"} {a.Reach} ft., {a.Targets} creature{a.Targets && a.Targets > 1 ? "s" : ""}. </>}
                {a.Damage && <><i>Hit:</i> {a.Damage.map(d => d.Amount + " " + d.Type + " damage").join(", ")}. </>}
                {a.AdditionalDescription}
                <br />
            </section>)}
        </>
    );
}

function SimpleActionsDisplay({ actions }: { actions: StatBlock["BonusActions"] }) {
    if (!actions) return null;
    return (
        <>
            {actions.map((a, k) => <section key={k}>
                <strong>{a.Name}</strong> {a.Description}<br />
            </section>)}
        </>
    );
}

function LegendaryActionsDisplay({ legendaryActions }: { legendaryActions: StatBlock["LegendaryActions"] }) {
    if (!legendaryActions) return null;
    return (
        <>
            {legendaryActions.Description} <br />
            <SimpleActionsDisplay actions={legendaryActions.Actions} />
        </>
    );
}

function MythicActionsDisplay({ mythicActions }: { mythicActions: StatBlock["MythicActions"] }) {
    if (!mythicActions) return null;
    return (
        <>
            {mythicActions.Description} <br />
            <SimpleActionsDisplay actions={mythicActions.Actions} />
        </>
    );
}

type StatBlockDisplayProps = {
    statBlock: StatBlock;
    displayColumns?: number;
    size: "small" | "medium" | "large";
    deleteCallback?: () => void;
}

export function StatBlockDisplay({ statBlock, displayColumns, size, deleteCallback }: StatBlockDisplayProps) {
    const dynamicStyles: React.CSSProperties = {
        columnCount: displayColumns || 2,
        fontSize: size === "small" ? "1.25rem" : size === "medium" ? "1.5rem" : "1.75rem"
    }
    return (
        <div className="statblock displayCard" style={dynamicStyles}>
            {deleteCallback && <button className="delete button" onClick={deleteCallback}>X</button>}
            <Card>
                <h4>{statBlock.Name}</h4>
                {statBlock.Description.Size} {statBlock.Description.Type}, {statBlock.Description.Alignment}
                <hr />
                <strong>Armor Class:</strong> {statBlock.Stats.ArmorClass} <br />
                <strong>Hit Points:</strong> {statBlock.Stats.HitPoints.Average} {statBlock.Stats.HitPoints.Dice.length>0 && <>({statBlock.Stats.HitPoints.Dice})</>} <br />
                <strong>Speed:</strong> {Object.entries(statBlock.Stats.Speed).map(([key, value]) => {
                    return value !== 0 ? <span key={key}>{key}: {value} ft. </span> : null
                })}
                <hr />
                <section className="justify-between">
                    <StatDisplay name="STR" value={statBlock.Stats.Abilities.dGet("Strength", 10)} />
                    <StatDisplay name="DEX" value={statBlock.Stats.Abilities.dGet("Dexterity", 10)} />
                    <StatDisplay name="CON" value={statBlock.Stats.Abilities.dGet("Constitution", 10)} />
                    <StatDisplay name="INT" value={statBlock.Stats.Abilities.dGet("Intelligence", 10)} />
                    <StatDisplay name="WIS" value={statBlock.Stats.Abilities.dGet("Wisdom", 10)} />
                    <StatDisplay name="CHA" value={statBlock.Stats.Abilities.dGet("Charisma", 10)} />
                </section>
                <hr />
            </Card>
            <Card>
                {statBlock.Details.Skills.length > 0 && <><strong>Skills:</strong> {statBlock.Details.Skills.map(({ Name, Level, Override }) => {
                    let num = Override !== 0 ? Override : modifierOf(statBlock.Stats.Abilities.dGet(Name, 10)) + (Level * statBlock.ProficiencyBonus);
                    return <span key={Name}>{Name} {num > 0 ? "+" : ""}{num} </span>
                })} <br /></>}
                {statBlock.Details.SavingThrows.length > 0 && <><strong>Saving Throws:</strong> {statBlock.Details.SavingThrows.map(({ Name, Level, Override }) => {
                    let num = Override !== 0 ? Override : modifierOf(statBlock.Stats.Abilities.dGet(Name, 10)) + (Level * statBlock.ProficiencyBonus);
                    return <span key={Name}>{Name} {num > 0 ? "+" : ""}{num} </span>
                })} <br /></>}
                {statBlock.DamageModifiers.Immunities.length > 0 && <><strong>Damage Immunities:</strong> {statBlock.DamageModifiers.Immunities.join(", ")}<br /></>}
                {statBlock.DamageModifiers.Resistances.length > 0 && <><strong>Damage Resistances:</strong> {statBlock.DamageModifiers.Resistances.join(", ")}<br /></>}
                {statBlock.DamageModifiers.Vulnerabilities.length > 0 && <><strong>Damage Vulnerabilities:</strong> {statBlock.DamageModifiers.Vulnerabilities.join(", ")}<br /></>}
                {statBlock.ConditionImmunities.length > 0 && <><strong>Condition Immunities:</strong> {statBlock.ConditionImmunities.join(", ")}<br /></>}
                <strong>Senses:</strong> {statBlock.Details.Senses.map(({ Name, Modifier }) => {
                    return <span key={Name}>{Name} {Modifier} ft. </span>
                })} <br />
                <strong>Languages:</strong> {statBlock.Details.Languages.Languages.join(", ")} <br />
                <span className="justify-between">
                    <span><strong>Challenge Rating:</strong> {statBlock.ChallengeRating}</span>
                    <span><strong>Proficiency Bonus:</strong> +{statBlock.ProficiencyBonus}</span>
                </span>
            </Card>
            {statBlock.Actions.length > 0 && <Card>
                <h5>Actions</h5>
                <hr className="thin" />
                <ActionsDisplay actions={statBlock.Actions} />
            </Card>}
            {statBlock.BonusActions && statBlock.BonusActions.length > 0 && <Card>
                <h5>Bonus Actions</h5>
                <hr className="thin" />
                <SimpleActionsDisplay actions={statBlock.BonusActions} />
            </Card>}
            {statBlock.Reactions && statBlock.Reactions.length > 0 && <Card>
                <h5>Reactions</h5>
                <hr className="thin" />
                <SimpleActionsDisplay actions={statBlock.Reactions} />
            </Card>}
            {statBlock.LegendaryActions && statBlock.LegendaryActions.Actions && statBlock.LegendaryActions.Actions.length > 0 && <Card>
                <h5>Legendary Actions</h5>
                <hr className="thin" />
                <LegendaryActionsDisplay legendaryActions={statBlock.LegendaryActions} />
            </Card>}
            {statBlock.MythicActions && statBlock.MythicActions.Actions && statBlock.MythicActions.Actions.length > 0 && <Card>
                <h5>Mythic Actions</h5>
                <hr className="thin" />
                <MythicActionsDisplay mythicActions={statBlock.MythicActions} />
            </Card>}
        </div>
    );
}