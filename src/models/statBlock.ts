import { Lair } from "@src/models/lair";
import { SmartMap } from "@src/models/data_structures/smartMap";

export type StatBlockJSON = {
    ID: number;
    Name: string;
    ChallengeRating: number;
    ProficiencyBonus: number;
    Source?: string;
    Description: {
        Size: string;
        Type: string;
        Alignment: string;
        Category: string;
    };
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
        Abilities: Record<string, number>;
    };
    DamageModifiers: {
        Vulnerabilities: string[];
        Resistances: string[];
        Immunities: string[];
    };
    ConditionImmunities: string[];
    Details: {
        ArmorType: string;
        Skills: {
            Name: string;
            Level: number;
            Override: number;
        }[];
        SavingThrows: {
            Name: string;
            Level: number;
            Override: number;
        }[];
        Senses: {
            Name: string;
            Modifier: number;
        }[];
        Languages: {
            Note?: string;
            Languages: string[];
        };
        Traits: {
            Name: string;
            Description: string;
        }[];
        SpellSaveDC?: number;
    };
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
    }[];
    BonusActions?: {
        Name: string;
        Description: string;
    }[];
    Reactions?: {
        Name: string;
        Description: string;
    }[];
    LegendaryActions?: {
        Points: number;
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    };
    MythicActions?: {
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    };
    Lair?: Lair;
};

export type StatBlock = {
    ID: number;
    Name: string;
    ChallengeRating: number;
    ProficiencyBonus: number;
    Source?: string;
    Description: {
        Size: string;
        Type: string;
        Alignment: string;
        Category: string;
    };
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
        Abilities: SmartMap<string, number>;
    };
    DamageModifiers: {
        Vulnerabilities: string[];
        Resistances: string[];
        Immunities: string[];
    };
    ConditionImmunities: string[];
    Details: {
        ArmorType: string;
        Skills: {
            Name: string;
            Level: number;
            Override: number;
        }[];
        SavingThrows: {
            Name: string;
            Level: number;
            Override: number;
        }[];
        Senses: {
            Name: string;
            Modifier: number;
        }[];
        Languages: {
            Note?: string;
            Languages: string[];
        };
        Traits: {
            Name: string;
            Description: string;
        }[];
        SpellSaveDC?: number;
    };
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
    }[];
    BonusActions?: {
        Name: string;
        Description: string;
    }[];
    Reactions?: {
        Name: string;
        Description: string;
    }[];
    LegendaryActions?: {
        Points: number;
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    };
    MythicActions?: {
        Description: string;
        Actions: {
            Name: string;
            Description: string;
            Cost: number;
        }[];
    };
    Lair?: Lair;
};

export function parseDataAsStatBlock(data: StatBlockJSON): StatBlock {
    if (data === null || data === undefined) {
        throw new Error("Data is null or undefined");
    }
    const statBlock = {} as StatBlock;
    Object.assign(statBlock, data);
    statBlock.Stats.Abilities = SmartMap.fromMap(data.Stats.Abilities);
    return statBlock;
}
