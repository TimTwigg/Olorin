import { SmartMap } from "@src/models/data_structures/smartMap";

export enum EntityType {
    StatBlock,
    Player,
}

export type EntityOverviewT = {
    ID: number;
    Name: string;
    Type: string;
    Size: string;
    ChallengeRating: number;
    Source: string;
};

export class EntityOverview implements EntityOverviewT {
    ID: number;
    Name: string;
    Type: string;
    Size: string;
    ChallengeRating: number;
    Source: string;

    constructor(ID: number, Name: string, Type: string, Size: string, ChallengeRating: number, Source: string) {
        this.ID = ID;
        this.Name = Name;
        this.Type = Type;
        this.Size = Size;
        this.ChallengeRating = ChallengeRating;
        this.Source = Source;
    }
}

export type EntityJSON = {
    DBID: number;
    ID: string;
    Name: string;
    Suffix: string;
    Initiative: number;
    MaxHitPoints: number;
    TempHitPoints: number;
    CurrentHitPoints: number;
    ArmorClass: number;
    ArmorClassBonus: number;
    Speed: {
        Walk?: number;
        Fly?: number;
        Swim?: number;
        Burrow?: number;
        Climb?: number;
    };
    Conditions: Record<string, number>;
    SpellSaveDC: number;
    SpellSlots: Record<number, { total: number; used: number }>;
    Concentration: boolean;
    Notes: string;
    IsHostile: boolean;
    EncounterLocked: boolean;
    Displayable: unknown;
    EntityType: number;
    SavingThrows: Record<string, number>;
    ChallengeRating: number;
};

export interface Entity {
    DBID: number;
    ID: string;
    Name: string;
    Suffix: string;
    Initiative: number;
    MaxHitPoints: number;
    TempHitPoints: number;
    CurrentHitPoints: number;
    ArmorClass: number;
    ArmorClassBonus: number;
    Speed: {
        Walk?: number;
        Fly?: number;
        Swim?: number;
        Burrow?: number;
        Climb?: number;
    };
    Conditions: SmartMap<string, number>;
    SpellSaveDC: number;
    SpellSlots: SmartMap<number, { total: number; used: number }>;
    Concentration: boolean;
    Notes: string;
    IsHostile: boolean;
    EncounterLocked: boolean;
    Displayable: unknown;
    EntityType: EntityType;
    SavingThrows: SmartMap<string, number>;
    ChallengeRating: number;

    tick(): void;
    setSuffix(suffix: string): void;
    randomizeInitiative(): void;
    setInitiative(value: number): void;
    heal(amount: number): void;
    damage(amount: number): void;
    setMaxHP(amount: number): void;
    addTempHP(amount: number): void;
    removeTempHP(): void;
    kill(): void;
    setACBonus(amount: number): void;
    addCondition(condition: string): void;
    removeCondition(condition: string): void;
    addSpellSlot(level: number): void;
    removeSpellSlot(level: number): void;
    useSpellSlot(level: number): void;
    resetSpellSlots(): void;
    setConcentration(value: boolean): void;
    resetAll(): void;
    setHostile(value: boolean): void;
    setLock(value: boolean): void;
    generateNewId(): void;
    setNotes(notes: string): void;
    copy(): Entity;
}

export function isEntity(arg: object): arg is Entity {
    return Object.hasOwn(arg, "EntityType");
}
