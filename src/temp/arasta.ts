export const arasta = {
    "Name": "Arasta",
    "ChallengeRating": 21,
    "ProficiencyBonus": 7,
    "Description": {
        "Size": "Huge",
        "Type": "Monstrosity",
        "Alignment": "Neutral Evil"
    },
    "Stats": {
        "ArmorClass": 19,
        "HitPoints": {
            "Average": 300,
            "Dice": ""
        },
        "Speed": {
            "Walk": 40,
            "Climb": 40
        },
        "Strength": 24,
        "Dexterity": 16,
        "Constitution": 23,
        "Intelligence": 15,
        "Wisdom": 22,
        "Charisma": 17
    },
    "DamageModifiers": {
        "Resistances": [
            "Bludgeoning, Piercing, and Slashing from Nonmagical Attacks"
        ],
        "Immunities": [
            "Acid",
            "Poison"
        ],
        "Vulnerabilities": []
    },
    "ConditionImmunities": [
        "Poisoned"
    ],
    "Details": {
        "ArmorType": "Natural Armor",
        "Skills": [
            {
                "Name": "Arcana",
                "Modifier": 9
            },
            {
                "Name": "Deception",
                "Modifier": 10
            },
            {
                "Name": "Intimidation",
                "Modifier": 10
            },
            {
                "Name": "Nature",
                "Modifier": 9
            },
            {
                "Name": "Perception",
                "Modifier": 13
            },
            {
                "Name": "Stealth",
                "Modifier": 10
            }
        ],
        "SavingThrows": [
            {
                "Name": "Dexterity",
                "Modifier": 10
            },
            {
                "Name": "Constitution",
                "Modifier": 13
            },
            {
                "Name": "Wisdom",
                "Modifier": 13
            }
        ],
        "Senses": [
            {
                "Name": "Passive Perception",
                "Modifier": 23
            },
            {
                "Name": "Darkvision",
                "Modifier": 120
            },
            {
                "Name": "Blindsight",
                "Modifier": 60
            }
        ],
        "Languages": {
            "Languages": [
                "Common",
                "Celestial",
                "Sylvan"
            ]
        },
        "Traits": [
            {
                "Name": "Armor of Spiders (Mythic Trait; Recharges after a Short or Long Rest).",
                "Description": "If Arasta is reduced to 0 hit points, she doesn't die or fall unconscious. Instead, she regains 200 hit points. In addition, Arasta's children immediately swarm over her body to protect her, granting her 100 temporary hit points."
            },
            {
                "Name": "Legendary Resistance (3/Day).",
                "Description": "If Arasta fails a saving throw, she can choose to succeed instead."
            },
            {
                "Name": "Magic Resistance.",
                "Description": "Arasta has advantage on saving throws against spells and other magical effects."
            },
            {
                "Name": "Spider Climb.",
                "Description": "Arasta can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check."
            },
            {
                "Name": "Web Walker.",
                "Description": "Arasta ignores movement restrictions caused by webbing."
            }
        ]
    },
    "Actions": [
        {
            "Name": "Multiattack",
            "AdditionalDescription": "Arasta makes three attacks: one with her bite and two with her claws."
        },
        {
            "Name": "Bite",
            "AttackType": "Melee Weapon Attack",
            "ToHitModifier": 14,
            "Reach": 5,
            "Targets": 1,
            "Damage": [
                {
                    "Amount": "3d8 + 7",
                    "Type": "Piercing"
                },
                {
                    "Amount": "5d12",
                    "Type": "Poison",
                    "SavingThrow": {
                        "Ability": "Constitution",
                        "DC": 21,
                        "HalfDamage": true,
                        "Note": "If the damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way."
                    }
                }
            ]
        },
        {
            "Name": "Claw",
            "AttackType": "Melee Weapon Attack",
            "ToHitModifier": 14,
            "Reach": 5,
            "Targets": 1,
            "Damage": [
                {
                    "Amount": "3d6 + 7",
                    "Type": "Slashing"
                }
            ]
        },
        {
            "Name": "Web  of Hair (Recharge 4-6).",
            "AdditionalDescription": "Arasta unleashes her hair in the form of webbing that fills a 30-foot cube next to her. The web is difficult terrain, its area is lightly obscured, and it lasts for 1 minute. Any creature that moves into the web or that starts its turn there must make a DC 21 Dexterity saving throw. On a failed save, the creature is restrained while in the web. A creature can use an action to make a DC 21 Strength check. On a success, it can free itself or a creature within 5 feet of it that is restrained by the web. \n\nThis webbing is immune to all damage except magical fire. A 5-foot cube of the web is destroyed if it takes at least 20 fire damage from a spell or other magical source on a single turn."
        }
    ],
    "LegendaryActions": {
        "Points": 3,
        "Description": "Arasta can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. Arasta regains spent legendary actions at the start of her turn.",
        "Actions": [
            {
                "Name": "Claws",
                "Cost": 1,
                "Description": "Arasta makes one attack with her claws."
            },
            {
                "Name": "Swarm",
                "Cost": 2,
                "Description": "Arasta causes two swarms of spiders to appear in unoccupied spaces within 5 feet of her."
            },
            {
                "Name": "Toxic Web",
                "Cost": 3,
                "Description": "Each creature restrained by Arasta's Web of Hair takes 18 (4d8) poison damage."
            }
        ]
    },
    "MythicActions": {
        "Description": "If Arasta's mythic trait is active, she can use the options below as legendary actions, as long as she has temporary hit points from her Armor of Spiders.",
        "Actions": [
            {
                "Name": "Web of Hair",
                "Cost": 2,
                "Description": "Arasta recharges Web of Hair and uses it."
            },
            {
                "Name": "Nyx Weave",
                "Cost": 2,
                "Description": "Each creature restrained by Arasta's Web of Hair must succeed on a DC 21 Constitution saving throw, or the creature takes 26 (4d12) force damage and any spell of 6th level or lower on it ends."
            }
        ]
    },
    "Lair": {
        "Description": "Arasta lives in an enormous, gnarled olive tree called Enorasi, which was planted millennia ago by Klothys. It is said that those who eat of its fruit can see glimpses of the future. Eating the fruit brings with it a risk, though, for those who Klothys finds unworthy might be driven mad. There, within Enorasi's hollow trunk, Arasta awaits the next would-be prophet to make her meal. Her webs stretch beyond the branches of the tree and carpet the forest floor of her realm. \n\nTales are told of forlorn souls who, because of grief or madness over the loss of a loved one, have sought out Arasta's lair, as it is rumored that some of the strands of her web are anchored near the edge of the Underworld and can enable a traveler to reach that realm's ashen shores. But those who enter her domain unbidden almost never go unnoticed, for Arasta can sense the slightest vibration along her web hair, and her children act as spies on her behalf.",
        "Initiative": 20,
        "Actions": {
            "Description": "On initiative count 20 (losing initiative ties), Arasta can take a lair action to cause one of the following effects. She can't use the same effect two rounds in a row.",
            "Items": [
                "Arasta learns about any creature touching her webs. Each creature restrained by a web or Arasta's Web of Hair must make a DC 21 Intelligence saving throw. On a failed save, Arasta gains knowledge of a creature's name, race, where they consider home, and what brought them to her web.",
                "Arasta casts the giant insect spell (spiders only). It lasts until she uses this lair action again or until she dies."
            ]
        },
        "RegionalEffects": {
            "Description": "The region containing Arasta's lair is warped by her presence, which creates one or more of the following effects. If Arasta dies, the spiders and insects lose their supernatural link to her. The webs remain, but they dissolve within 1d10 days.",
            "Items": [
                "Spiders and insects within 1 mile of Arasta's lair serve as her eyes and ears. Birds and other flying creatures are absent from the skies and occasionally found trapped in webs.",
                "Within 1 mile of Arasta's lair, webs fill all 10-foot cubes of open space, so long as the webs can be anchored between two solid masses (such as walls or trees). The webs are flammable. Any webs exposed to fire burn away in 1 round. Any destroyed webs are magically repaired at the next dawn."
            ]
        }
    }
}