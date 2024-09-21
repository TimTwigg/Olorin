export const winter_ghoul =
{
    "Name": "Winter Ghoul",
    "ChallengeRating": 1,
    "ProficiencyBonus": 2,
    "Description": {
        "Size": "Medium",
        "Type": "Undead",
        "Alignment": "Chaotic Evil"
    },
    "Stats": {
        "ArmorClass": 12,
        "HitPoints": {
            "Average": 22,
            "Dice": "5d8"
        },
        "Speed": {
            "Walk": 30
        },
        "ReactionCount": 1,
        "Strength": 13,
        "Dexterity": 15,
        "Constitution": 10,
        "Intelligence": 7,
        "Wisdom": 10,
        "Charisma": 6
    },
    "DamageModifiers": {
        "Vulnerabilities": [],
        "Resistances": [],
        "Immunities": [
            "Cold"
        ]
    },
    "ConditionImmunities": [],
    "Details": {
        "ArmorType": "Natural Armor",
        "Skills": [
            {
                "Name": "Stealth",
                "Modifier": 4
            }
        ],
        "SavingThrows": [],
        "Senses": [
            {
                "Name": "Darkvision",
                "Modifier": 60
            },
            {
                "Name": "Passive Perception",
                "Modifier": 10
            }
        ],
        "Languages": {
            "Languages": [
                "Common"
            ]
        },
        "Traits": [
            {
                "Name": "Snow Camouflage",
                "Description": "The ghoul has advantage on Dexterity (Stealth) checks made to hide in snowy terrain."
            }
        ]
    },
    "Actions": [
        {
            "Name": "Bite",
            "AttackType": "Melee Weapon Attack",
            "ToHitModifier": 2,
            "Reach": 5,
            "Targets": 1,
            "Damage": [
                {
                    "Amount": "2d6 + 2",
                    "Type": "Piercing"
                }
            ],
            "AdditionalDescription": ""
        },
        {
            "Name": "Claws",
            "AttackType": "Melee Weapon Attack",
            "ToHitModifier": 4,
            "Reach": 5,
            "Target": 1,
            "Damage": [
                {
                    "Amount": "2d4 + 2",
                    "Type": "Slashing"
                }
            ],
            "AdditionalDescription": "If the target is a creature other than an undead, it must succeed on a DC 10 Constitution saving throw. On a failed save, a target begins to freeze and is restrained. The restrained target must repeat the saving throw at the end of each of its turns. On a success, the effect ends on the target. On a failure, the target is stunned.\n\tIf the target fails this saving throw again, they are frozen and petrified. The target remains petrified for 24 hours, after which they thaw, or until freed by the greater restoration spell or other magic."
        }
    ]
}