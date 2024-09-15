import "@src/styles/statblock.scss"

export type StatBlock = {
    Name: string;
    ChallengeRating: number;
    ProficiencyBonus: number;
    Description: {
        Size: string;
        Type: string;
        Alignment: string;
    },
    Stats: {
        ArmorClass: number;
        HitPoints: {
            Average: number;
            Dice: string;
        };
        Speed: {
            Walk?: number;
            Fly?: number;
            Swim?: number;
            Burrow?: number;
            Climb?: number;
        };
        Strength: number;
        Dexterity: number;
        Constitution: number;
        Intelligence: number;
        Wisdom: number;
        Charisma: number;
    },
    DamageModifiers: {
        Vulnerabilities: string[];
        Resistances: string[];
        Immunities: string[];
    },
    ConditionImmunities: string[];
    Details: {
        ArmorType: string;
        Skills: {
            Name: string;
            Modifier: number;
        }[],
        SavingThrows: {
            Name: string;
            Modifier: number;
        }[],
        Senses: {
            Name: string;
            Modifier: number;
        }[],
        Languages: {
            Note?: string;
            Languages: string[];
        }
        Traits: {
            Name: string;
            Description: string;
        }[],
    },
    Actions: {
        Name: string;
        AttackType?: string;
        ToHitModifier?: number;
        Reach?: number;
        Targets?: number;
        Damage?: {
            Amount: string;
            Type: string;
            AlternativeDamage?: {
                Amount: string;
                Type: string;
                Note: string;
            };
            SavingThrow?: {
                Ability: string;
                DC: number;
                HalfDamage: boolean;
                Note?: string;
            };
        }[];
        AdditionalDescription?: string;
    }[]
}

type Props = {
    statBlock: StatBlock;
}

function StatDisplay({ name, value }: { name: string, value: number }) {
    const modifier = Math.floor((value - 10) / 2);
    return (
        <span className = "statdisplay">
            <strong>{name}</strong> <br/>
            {value} ({modifier < 0 ? "" : "+"}{modifier})
        </span>
    );
}

function ActionDisplay({ action }: { action: StatBlock["Actions"][0] }) {
    return (
        <div>
            <p>
                <strong>{action.Name} </strong>
                {action.AttackType && <i>{action.AttackType}: </i>}
                {action.ToHitModifier && <>{action.ToHitModifier} to hit, {action.AttackType?.startsWith("Melee") ? "reach" : "range"} {action.Reach} ft., {action.Targets} creature{action.Targets&&action.Targets>1?"s":""}. </>}
                {action.Damage && <><i>Hit:</i> {action.Damage.map(d => d.Amount+" "+d.Type+" damage").join(", ")}. </>}
                {action.AdditionalDescription}
            </p>
        </div>
    );
}

export function StatBlockDisplay({ statBlock }: Props) {
    return (
        <div className="statblock five columns container">
            <span className="six columns">
                <h4>{statBlock.Name}</h4>
                <p>
                    {statBlock.Description.Size} {statBlock.Description.Type}, {statBlock.Description.Alignment}
                </p>
                <hr />
                <p>
                    <strong>Armor Class:</strong> {statBlock.Stats.ArmorClass} <br />
                    <strong>Hit Points:</strong> {statBlock.Stats.HitPoints.Average} ({statBlock.Stats.HitPoints.Dice}) <br />
                    <strong>Speed:</strong> {Object.entries(statBlock.Stats.Speed).map(([key, value]) => {
                        return <span key={key}>{key}: {value} ft. </span>
                    })}
                </p>
                <hr />
                <p className = "justify-between">
                    <StatDisplay name="STR" value={statBlock.Stats.Strength} />
                    <StatDisplay name="DEX" value={statBlock.Stats.Dexterity} />
                    <StatDisplay name="CON" value={statBlock.Stats.Constitution} />
                    <StatDisplay name="INT" value={statBlock.Stats.Intelligence} />
                    <StatDisplay name="WIS" value={statBlock.Stats.Wisdom} />
                    <StatDisplay name="CHA" value={statBlock.Stats.Charisma} />
                </p>
                <hr />
                <p>
                    {statBlock.DamageModifiers.Immunities.length > 0 && <><strong>Damage Immunities:</strong> {statBlock.DamageModifiers.Immunities.join(", ")}<br /></>}
                    {statBlock.DamageModifiers.Resistances.length > 0 && <><strong>Damage Resistances:</strong> {statBlock.DamageModifiers.Resistances.join(", ")}<br /></>}
                    {statBlock.DamageModifiers.Vulnerabilities.length > 0 && <><strong>Damage Vulnerabilities:</strong> {statBlock.DamageModifiers.Vulnerabilities.join(", ")}<br /></>}
                    {statBlock.ConditionImmunities.length > 0 && <><strong>Condition Immunities:</strong> {statBlock.ConditionImmunities.join(", ")}<br /></>}
                    <strong>Senses:</strong> {statBlock.Details.Senses.map(({ Name, Modifier }) => {
                        return <span key={Name}>{Name} {Modifier} ft. </span>
                    })} <br />
                    <strong>Languages:</strong> {statBlock.Details.Languages.Languages.join(", ")} <br />
                    <span className = "justify-between">
                        <span><strong>Challenge Rating:</strong> {statBlock.ChallengeRating}</span>
                        <span><strong>Proficiency Bonus:</strong> +{statBlock.ProficiencyBonus}</span>
                    </span>
                </p>
            </span>
            <span className="six columns">
                <h5>Actions</h5>
                <hr className="thin" />
                {statBlock.Actions.map((action, index) => {
                    return <ActionDisplay key={index} action={action} />
                })}
            </span>
        </div>
    );
}