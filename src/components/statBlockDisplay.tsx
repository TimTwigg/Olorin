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
                {a.ToHitModifier && <>{a.ToHitModifier} to hit, {a.AttackType?.startsWith("Melee") ? "reach" : "range"} {a.Reach} ft., {a.Targets} creature{a.Targets && a.Targets > 1 ? "s" : ""}. </>}
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
}

export function StatBlockDisplay({ statBlock, displayColumns }: StatBlockDisplayProps) {
    const dynamicStyles: React.CSSProperties = {
        columnCount: displayColumns || 2
    }
    return (
        <div className="displayCard" style={dynamicStyles}>
            <Card>
                <h4>{statBlock.Name}</h4>
                {statBlock.Description.Size} {statBlock.Description.Type}, {statBlock.Description.Alignment}
                <hr />
                <strong>Armor Class:</strong> {statBlock.Stats.ArmorClass} <br />
                <strong>Hit Points:</strong> {statBlock.Stats.HitPoints.Average} {statBlock.Stats.HitPoints.Dice.length>0 && <>({statBlock.Stats.HitPoints.Dice})</>} <br />
                <strong>Speed:</strong> {Object.entries(statBlock.Stats.Speed).map(([key, value]) => {
                    return <span key={key}>{key}: {value} ft. </span>
                })}
                <hr />
                <section className="justify-between">
                    <StatDisplay name="STR" value={statBlock.Stats.Strength} />
                    <StatDisplay name="DEX" value={statBlock.Stats.Dexterity} />
                    <StatDisplay name="CON" value={statBlock.Stats.Constitution} />
                    <StatDisplay name="INT" value={statBlock.Stats.Intelligence} />
                    <StatDisplay name="WIS" value={statBlock.Stats.Wisdom} />
                    <StatDisplay name="CHA" value={statBlock.Stats.Charisma} />
                </section>
                <hr />
            </Card>
            <Card>
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
            <Card>
                <h5>Actions</h5>
                <hr className="thin" />
                <ActionsDisplay actions={statBlock.Actions} />
            </Card>
            {statBlock.BonusActions && <Card>
                <h5>Bonus Actions</h5>
                <hr className="thin" />
                <SimpleActionsDisplay actions={statBlock.BonusActions} />
            </Card>}
            {statBlock.Reactions && <Card>
                <h5>Reactions</h5>
                <hr className="thin" />
                <SimpleActionsDisplay actions={statBlock.Reactions} />
            </Card>}
            {statBlock.LegendaryActions && <Card>
                <h5>Legendary Actions</h5>
                <hr className="thin" />
                <LegendaryActionsDisplay legendaryActions={statBlock.LegendaryActions} />
            </Card>}
            {statBlock.MythicActions && <Card>
                <h5>Mythic Actions</h5>
                <hr className="thin" />
                <MythicActionsDisplay mythicActions={statBlock.MythicActions} />
            </Card>}
        </div>
    );
}