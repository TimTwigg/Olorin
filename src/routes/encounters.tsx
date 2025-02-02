import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ToastContainer, toast } from "react-toastify";

import * as api from "@src/controllers/api";
import { Encounter, EncounterMetadata } from "@src/models/encounter";
import { EntityDisplay } from "@src/components/entityDisplay";
import { Entity, EntityOverview, EntityType, isEntity } from "@src/models/entity";
import { StatBlockDisplay } from "@src/components/statBlockDisplay";
import { StatBlock } from "@src/models/statBlock";
import { Lair, isLair } from "@src/models/lair";
import { UserOptions } from "@src/models/userOptions";

import { FaAddressCard } from "react-icons/fa";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { LairDisplay, LairDialog, LairBlockDisplay } from "@src/components/lair";

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

/**
 * Cache Size for Entities List
 */
const CACHESIZE = 100;

function Encounters() {
    const [encounters, SetEncounters] = React.useState<Encounter[]>([]);
    const [activeEncounter, SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [backupEncounter, SetBackupEncounter] = React.useState<Encounter | null>(null);
    const [runningEncounter, SetRunningEncounter] = React.useState<boolean>(false);
    const [DisplayEntity, SetDisplayEntity] = React.useState<Entity | Lair | undefined>();
    const [Config, SetConfig] = React.useState<UserOptions>(new UserOptions());
    const [EncounterIsActive, SetEncounterIsActive] = React.useState<boolean>(false);
    const [EditingEncounter, SetEditingEncounter] = React.useState<boolean>(false);
    const [IsNewEncounter, SetIsNewEncounter] = React.useState<boolean>(false);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");
    const [CreatureList, SetCreatureList] = React.useState<EntityOverview[]>([]);
    const [FullEntityList, SetFullEntityList] = React.useState<Entity[]>([]);
    const [LairDialogVisible, SetLairDialogVisible] = React.useState<boolean>(false);
    const [LairDialogList, SetLairDialogList] = React.useState<{ Name: string, Lair: Lair }[]>([]);

    /**
     * Add an Entity to the Entity List. Manages caching of entities.
     * 
     * @param entity The Entity to add to the list
     */
    const appendToEntityList = (entity: Entity) => {
        let list = FullEntityList;
        let newLength = list.push(entity);
        if (newLength > CACHESIZE) list.shift();
        SetFullEntityList(list);
    }

    /**
     * Trigger a re-render of the Encounter Display.
     */
    async function TriggerReRender() {
        // This is a hack to force a re-render of the Encounter Display
        // React rerenders if a state changes
        if (activeEncounter) SetActiveEncounter(activeEncounter.copy());
    }

    /**
     * Reset all states to their default values.
     * 
     * Causes the screen to return to the Encounters Overview.
     */
    const resetAllStates = () => {
        SetActiveEncounter(null);
        SetRunningEncounter(false);
        SetDisplayEntity(undefined);
        SetEncounterIsActive(false);
        SetEditingEncounter(false);
        SetIsNewEncounter(false);
    }

    const deleteEntity = (entityID: string) => {
        for (let e of activeEncounter?.Entities || []) console.log(e.id);
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.removeEntity(entityID).copy());
        console.log("Entity Deleted: " + entityID);
    }

    const updateMetadata = (data: EncounterMetadata) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withMetadata(data));
    }

    const createNewEncounter = () => {
        let enc = new Encounter();
        enc.Metadata.CreationDate = new Date();
        enc.Metadata.AccessedDate = new Date();
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetLocalStringState3("");
        SetActiveEncounter(enc);
        SetEditingEncounter(true);
        SetIsNewEncounter(true);
    }

    const loadEncounterFromBackup = () => {
        if (!backupEncounter || !activeEncounter) return;
        SetActiveEncounter(activeEncounter.withEntities(backupEncounter.Entities).withLair(backupEncounter.Lair, backupEncounter.LairEntityName).copy());
        SetBackupEncounter(null);
    }

    /**
     * Initialize the local states for editing an Encounter.
     * 
     * Also resets the Encounter to its original state if the user cancels the edit.
     */
    const initializeStatesForEditing = () => {
        // If the user clicked cancel
        if (EditingEncounter) {
            // If the user is creating a new Encounter, cancel the creation
            if (IsNewEncounter) {
                setTimeout(() => SetActiveEncounter(null), 1);
                resetAllStates();
            }
            // Reset the Encounter to its original state
            else if (backupEncounter) {
                loadEncounterFromBackup();
            }
            return;
        }
        // If the user is entering edit mode, load the state of the Encounter
        SetLocalStringState1(activeEncounter?.Name || "");
        SetLocalStringState2(activeEncounter?.Metadata.Campaign || "");
        SetLocalStringState3(activeEncounter?.Description || "");
        SetBackupEncounter(activeEncounter ? activeEncounter.copy() : null);
    }

    /**
     * Save the changes made to the Encounter in Edit Mode. Also saves the Encounter to the API.
     */
    const saveEncounterChanges = () => {
        if (!activeEncounter) return;
        if (IsNewEncounter) {
            if (LocalStringState1.length === 0) {
                toast.error("Encounter must have a name");
                return;
            }
            SetEncounters([...encounters, activeEncounter]);
            SetIsNewEncounter(false);
        }
        SetActiveEncounter(activeEncounter.withName(LocalStringState1));
        SetBackupEncounter(null);
        updateMetadata({ Campaign: LocalStringState2 });
        SetActiveEncounter(activeEncounter.withDescription(LocalStringState3));
        SetEditingEncounter(false);
        api.saveEncounter("dummy", activeEncounter).then((res) => {
            if (res) toast.success("Encounter saved successfully to server.");
            else toast.error("Failed to save Encounter to server.");
        });
    }

    /**
     * Add a Lair to the Encounter
     */
    const openLairDialog = () => {
        if (!activeEncounter) return;
        let lairs = activeEncounter.Entities.filter((ent) => ent instanceof StatBlockEntity && ent.StatBlock.Lair).map((ent) => { return { Name: ent.Name, Lair: (ent as StatBlockEntity).StatBlock.Lair! } });
        if (lairs.length === 0) {
            toast.error("No lairs found in Encounter");
            return;
        }
        SetLairDialogList(lairs);
        SetLairDialogVisible(true);
    }

    const getLair = (Lair: Lair | undefined, Name: string) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withLair(Lair, Name));
    };

    /**
     * Render the Entity or Lair in the Display
     * 
     * @param item The Entity or Lair to render
     * @param overviewOnly Whether or not to render the full display
     */
    const renderDisplay = (item?: Entity | Lair, overviewOnly: boolean = false) => {
        if (!item) return <></>;
        if (isEntity(item) && item.EntityType === EntityType.StatBlock) {
            return <StatBlockDisplay statBlock={item.Displayable as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={overviewOnly ? 1 : Config.defaultColumns || 2} />;
        }
        else if (isEntity(item) && item.EntityType === EntityType.Player) return <></>;
        else if (isLair(item)) {
            return <LairBlockDisplay lair={item} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={overviewOnly ? 1 : Config.defaultColumns || 2} />;
        }
        else return <></>;
    }

    /**
     * Render the Entities in the Encounter
     */
    const renderEntities = (overviewOnly: boolean) => {
        if (!activeEncounter || activeEncounter.Entities.length === 0) return <></>;
        let entities: (Entity | Lair)[];
        if (activeEncounter.HasLair && activeEncounter.Lair) {
            entities = (activeEncounter.Entities as (Entity | Lair)[]).concat([activeEncounter.Lair]);
        }
        else {
            entities = activeEncounter.Entities;
        }

        const calc_sort_key = (a: Entity | Lair, b: Entity | Lair) => {
            let a_val = a.Initiative;
            let b_val = b.Initiative;
            // Ensure that lairs lose ties in initiative
            if (isLair(a)) a_val -= 0.5;
            if (isLair(b)) b_val -= 0.5;
            return b_val - a_val;
        };

        return entities.sort(calc_sort_key).map((entity, ind) => (isEntity(entity))
            ? <EntityDisplay key={`${entity.Name}${ind}`} entity={entity} deleteCallback={deleteEntity} setDisplay={SetDisplayEntity} renderTrigger={TriggerReRender} userOptions={{ conditions: Config.conditions }} overviewOnly={overviewOnly} editMode={EditingEncounter} isActive={ind === activeEncounter?.Metadata.Index} />
            : <LairDisplay key={`${activeEncounter.LairEntityName}_lair${ind}`} lair={activeEncounter.Lair!} overviewOnly={overviewOnly} isActive={ind === activeEncounter?.Metadata.Index} setDisplay={SetDisplayEntity} />);
    }

    /**
     * Get a list of entities from the API and store them in the CreatureList state
     * @param page The page number to get entities from
     * 
     */
    const getEntities = (page: number) => {
        api.getEntities("dummy", page, 1).then((res) => {
            SetCreatureList(res.Entities.map(e => e as EntityOverview));
        });
    }

    const getEntity = async (entityName: string): Promise<Entity | undefined> => {
        return api.getEntity("dummy", entityName).then((res) => {
            if (res.Entity === undefined) return;
            appendToEntityList(res.Entity);
            return res.Entity;
        });
    }

    const displayMiscEntity = (entityName: string) => {
        let entity = FullEntityList.find((ent) => ent.Name === entityName);
        if (entity) SetDisplayEntity(entity);
        else {
            getEntity(entityName).then((ent) => {
                if (ent) SetDisplayEntity(ent);
            });
        }
    }

    const addMiscEntity = (entityName: string) => {
        if (!activeEncounter) return;
        let entity = FullEntityList.find((ent) => ent.Name === entityName);
        if (!entity) {
            getEntity(entityName).then((ent) => {
                if (ent) SetActiveEncounter(activeEncounter.addEntity(ent));
            });
        }
        else {
            if (entity.EntityType === EntityType.StatBlock) entity = new StatBlockEntity(entity.Displayable as StatBlock);
            SetActiveEncounter(activeEncounter.addEntity(entity));
        }
        TriggerReRender();
    }

    React.useEffect(() => {
        api.getEncounters("dummy").then((res) => { SetEncounters(res.Encounters) });
    }, []);

    React.useEffect(() => {
        api.getConditions("dummy").then((res) => {
            let user = Config;
            user.conditions = res.Conditions;
            SetConfig(user);
        });
    }, []);

    React.useEffect(() => {
        getEntities(1);
    }, []);

    // Encounters Overview
    if (!activeEncounter) return (
        <>
            <h1>Encounters</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Encounters</h3>
                <button className="two columns" onClick={createNewEncounter}>Create New Encounter</button>
            </div>
            <div className="break" />
            <table className="ten columns offset-by-one column">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Campaign</th>
                        <th>Creation Date</th>
                        <th>Last Accessed</th>
                    </tr>
                </thead>
                <tbody>
                    {encounters?.map((encounter, ind) => {
                        return (
                            <tr key={`${encounter.Name}${ind}`}>
                                <td className="link"><a onClick={() => { SetActiveEncounter(encounter), SetEncounterIsActive(encounter.Metadata.Started || false) }}>{encounter.Name.replace(/\s/g, "").length > 0 ? encounter.Name : "<encounter name>"}</a></td>
                                <td>{encounter.Description}</td>
                                <td>{encounter.Metadata.Campaign || ""}</td>
                                <td>{encounter.Metadata.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</td>
                                <td>{encounter.Metadata.AccessedDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );

    // Encounter Play Screen
    return (
        <div className="playScreen container">
            <section className="justify-between">
                <span className="three columns"><button className="big button" onClick={() => { resetAllStates() }} disabled={EditingEncounter}>Back to Encounters</button></span>
                {EditingEncounter ?
                    <span className="six columns titleEdit"><input type="text" defaultValue={LocalStringState1} placeholder="Name" onChange={(e) => { SetLocalStringState1(e.target.value) }} /></span>
                    :
                    <h3 className="six columns">{activeEncounter.Name}</h3>
                }
                <section className="three columns">
                    <span><strong>Created On:</strong> {activeEncounter.Metadata.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</span><br />
                    <span><strong>Campaign:</strong> {EditingEncounter ? <input type="text" defaultValue={LocalStringState2} placeholder="Campaign Name" onChange={e => { SetLocalStringState2(e.target.value) }} /> : activeEncounter.Metadata.Campaign}</span>
                </section>
            </section>
            <div className="break" />
            <hr />
            {EditingEncounter ?
                <input type="text" className="ten columns descriptionEdit" defaultValue={LocalStringState3} placeholder="Encounter Description" onChange={(e) => { SetLocalStringState3(e.target.value) }} />
                :
                <p>{activeEncounter.Description}</p>
            }
            <div className="break" />
            <hr />
            <section className="container">
                <section id="buttonSet1" className="five columns">
                    <button onClick={() => { initializeStatesForEditing(), SetEditingEncounter(!EditingEncounter), updateMetadata({ AccessedDate: new Date() }) }} disabled={runningEncounter} >{EditingEncounter ? "Cancel" : "Edit Mode"}</button>
                    <button onClick={() => { SetRunningEncounter(!runningEncounter), SetEncounterIsActive(true), updateMetadata({ Started: true, AccessedDate: new Date() }), loadEncounterFromBackup(), SetDisplayEntity(undefined) }} disabled={EditingEncounter} >{runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter</button>
                    <button onClick={() => { SetActiveEncounter(activeEncounter.reset()), SetEncounterIsActive(false), TriggerReRender() }} disabled={runningEncounter || EditingEncounter} >Reset Encounter</button>
                </section>
                <section id="mode-log">
                    <p>{EditingEncounter ? "Editing" : ""}</p>
                </section>
                <section id="buttonSet2" className="five columns">
                    <button onClick={saveEncounterChanges} disabled={!EditingEncounter} >Save Changes</button>
                    <button onClick={openLairDialog} disabled={!EditingEncounter} >Set Lair</button>
                    <button onClick={() => { }} disabled={!EditingEncounter} >Add Player</button>
                </section>
                <div className="break" />
            </section>
            <hr />
            <section className="panel">
                <div>
                    <div id="EncounterList">
                        {renderEntities(!runningEncounter)}
                    </div>
                    <div id="EncounterRunControls">
                        <section>Round: {activeEncounter.Metadata.Round}</section>
                        <section>Turn: {activeEncounter.Metadata.Index! + 1}</section>
                        {runningEncounter && <button onClick={() => { SetActiveEncounter(activeEncounter.tick()), TriggerReRender() }}>NEXT</button>}
                    </div>
                </div>
                <div id="CreatureList" style={{ display: runningEncounter ? "none" : "block" }}>
                    {EditingEncounter &&
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>CR</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {CreatureList.map((creature, ind) => {
                                    return (
                                        <tr key={`${creature.Name}${ind}`}>
                                            <td>{creature.Name}</td>
                                            <td>{creature.Type}</td>
                                            <td>{creature.Size}</td>
                                            <td>{creature.DifficultyRating}</td>
                                            <td><button className="iconButton" onClick={() => { displayMiscEntity(creature.Name) }}><FaAddressCard /></button></td>
                                            <td><button className="iconButton" onClick={() => { addMiscEntity(creature.Name) }}>+</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    }
                </div>
                <div id="StatBlockDisplay" style={{ maxWidth: runningEncounter ? "60%" : "30%", margin: runningEncounter ? "0 5rem" : "0" }}>
                    {DisplayEntity && renderDisplay(DisplayEntity, !runningEncounter)}
                </div>
            </section>
            <ToastContainer position="top-right" />
            <LairDialog lairs={LairDialogList} visible={LairDialogVisible} onClose={() => { SetLairDialogVisible(false) }} ReturnLair={getLair} />
        </div>
    );
}