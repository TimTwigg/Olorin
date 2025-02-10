export const aurelia = {
    "Name": "Aurelia",
    "ChallengeRating": 23,
    "ProficiencyBonus": 7,
    "Source": "Guildmaster's Guide to Ravnica",
    "Description": {
        "Size": "Medium",
        "Type": "Celestial",
        "Alignment": "Lawful Good"
    },
    "Stats": {
        "ArmorClass": 22,
        "HitPoints": {
            "Average": 287,
            "Dice": ""
        },
        "Speed": {
            "Walk": 50,
            "Fly": 150
        },
        "ReactionCount": 1,
        "Strength": 26,
        "Dexterity": 24,
        "Constitution": 25,
        "Intelligence": 17,
        "Wisdom": 25,
        "Charisma": 30
    },
    "DamageModifiers": {
        "Resistances": [
            "Necrotic",
            "Radiant",
            "Bludgeoning, Piercing, and Slashing from Nonmagical Attacks"
        ],
        "Immunities": [
            "Poison"
        ],
        "Vulnerabilities": []
    },
    "ConditionImmunities": [
        "Charmed",
        "Exhaustion",
        "Frightened",
        "Paralyzed",
        "Poisoned"
    ],
    "Details": {
        "ArmorType": "Natural Armor",
        "Skills": [
            {
                "Name": "Insight",
                "Modifier": 14
            },
            {
                "Name": "Perception",
                "Modifier": 14
            }
        ],
        "SavingThrows": [
            {
                "Name": "Dexterity",
                "Modifier": 14
            },
            {
                "Name": "Constitution",
                "Modifier": 14
            },
            {
                "Name": "Charisma",
                "Modifier": 17
            }
        ],
        "Senses": [
            {
                "Name": "Truesight",
                "Modifier": 120
            },
            {
                "Name": "Passive Perception",
                "Modifier": 24
            }
        ],
        "Languages": {
            "Note": "All",
            "Languages": []
        },
        "Traits": [
            {
                "Name": "Legendary Resistance (3/Day)",
                "Description": "If Aurelia fails a saving throw, she can choose to succeed instead."
            },
            {
                "Name": "Magic Resistance",
                "Description": "Aurelia has advantage on saving throws against spells and other magical effects."
            }
        ]
    },
    "Actions": [
        {
            "Name": "Multiattack",
            "AdditionalDescription": "Aurelia makes three longsword attacks and uses Leadership."
        },
        {
            "Name": "Longsword",
            "AttackType": "Melee Weapon Attack",
            "ToHitModifier": 15,
            "Reach": 5,
            "Targets": 1,
            "Damage": [
                {
                    "Amount": "1d8 + 8",
                    "Type": "Slashing",
                    "AlternativeDamage": {
                        "Amount": "1d10 + 8",
                        "Type": "Slashing",
                        "Note": "when used with two hands."
                    }
                },
                {
                    "Amount": "6d8",
                    "Type": "Radiant"
                }
            ]
        },
        {
            "Name": "Leadership",
            "AdditionalDescription": "Aurelia utters a few inspiring words to one creature she can see within 30 feet of her. If the creature can hear her, it can add a d10 to one attack roll or saving throw it makes before the start of Aurelia's next turn."
        },
        {
            "Name": "Warleader's Helix (Recharge 5-6)",
            "AttackType": "Ranged Spell Attack",
            "ToHitModifier": 17,
            "Range": 60,
            "Targets": 1,
            "Damage": [
                {
                    "Amount": "12d8",
                    "Type": "Radiant"
                }
            ],
            "AdditionalDescription": "Aurelia can choose another creature she can see within 10 feet of the target. The second creature regains 6d8 hit points."
        }
    ],
    "Reactions": [
        {
            "Name": "Parry",
            "Description": "Aurelia adds 7 to her AC against one melee attack that would hit her. To do so, Aurelia must see the attacker and be wielding a melee weapon."
        },
        {
            "Name": "Unyielding",
            "Description": "When Aurelia is subjected to an effect that would move her, knock her prone, or both, she can use her reaction to be neither moved nor knocked prone."
        }
    ],
    "LegendaryActions": {
        "Points": 3,
        "Description": "Aurelia can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. Aurelia regains spent legendary actions at the start of her turn.",
        "Actions": [
            {
                "Name": "Command Allies",
                "Cost": 1,
                "Description": "Aurelia chooses up to three creatures she can see within 30 feet of her. If a chosen creature can see or hear Aurelia, it can immediately use its reaction to make one weapon attack, with advantage on the attack roll."
            },
            {
                "Name": "Longsword Attack",
                "Cost": 2,
                "Description": "Aurelia makes one longsword attack."
            },
            {
                "Name": "Frighten Foes",
                "Cost": 3,
                "Description": "Aurelia targets up to five creatures she can see within 30 feet of her. Each target must succeed on a DC 25 Wisdom saving throw or be frightened of her until the end of her next turn. Any target within 5 feet of Aurelia has disadvantage on the saving throw."
            }
        ]
    }
}