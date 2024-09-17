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
    }[],
    BonusActions?: {
        Name: string;
        Description: string;
    }[],
    Reactions?: {
        Name: string;
        Description: string;
    }[],
    LegendaryActions?: {
        Points: number;
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    },
    MythicActions?: {
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    },
    Lair?: {
        Description: string;
        Initiative: number;
        Actions?: {
            Description: string;
            Items: string[];
        },
        RegionalEffects?: {
            Description: string;
            Items: string[];
        },
    }
}