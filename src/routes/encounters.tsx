import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ToastContainer, toast } from "react-toastify";

import * as api from "@src/controllers/api";
import { Encounter, EncounterMetadata, EncounterOverview } from "@src/models/encounter";
import { EntityDisplay } from "@src/components/entityDisplay";
import { Entity, EntityOverview, EntityType, isEntity } from "@src/models/entity";
import { StatBlockDisplay } from "@src/components/statBlockDisplay";
import { StatBlock } from "@src/models/statBlock";
import { Lair, isLair } from "@src/models/lair";
import { UserOptions } from "@src/models/userOptions";

import { StatBlockEntity } from "@src/models/statBlockEntity";
import { LairDisplay, LairDialog, LairBlockDisplay } from "@src/components/lair";
import { EntityTable } from "@src/components/entityTable";

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

/**
 * Cache Size for Entities List
 */
const CACHESIZE = 100;

function Encounters() {
    const [encounters, SetEncounters] = React.useState<EncounterOverview[]>([]);
    const [activeEncounter, _SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [activeEncounterIndex, SetActiveEncounterIndex] = React.useState<number>(0);
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
    const getEncountersRef = React.useRef(0);

    var refs: Map<string, React.RefObject<HTMLDivElement>> = new Map();

    const SetActiveEncounter = (encounter: Encounter | null, save: boolean = false) => {
        _SetActiveEncounter(encounter);
        if (save && encounter) saveEncounter(false);
    }

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
        if (activeEncounter) SetActiveEncounter(activeEncounter.copy(), false);
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
        api.getEncounters("dummy").then((res) => { SetEncounters(res.Encounters) });
    }

    const deleteEntity = (entityID: string) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.removeEntity(entityID).copy());
    }

    const updateMetadata = (data: EncounterMetadata) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withMetadata(data));
    }

    const createNewEncounter = () => {
        let enc = new Encounter(0);
        enc.Metadata.CreationDate = new Date();
        enc.Metadata.AccessedDate = new Date();
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetLocalStringState3("");
        SetActiveEncounter(enc, false);
        SetEditingEncounter(true);
        SetIsNewEncounter(true);
    }

    const loadEncounterFromBackup = () => {
        if (!backupEncounter || !activeEncounter) return;
        SetActiveEncounter(activeEncounter
            .withEntities(backupEncounter.Entities)
            .withLair(backupEncounter.Lair, backupEncounter.LairEntityName)
            .setInitiativeOrder()
            .copy()
            , false);
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
            // Clear the display
            SetDisplayEntity(undefined);
            return;
        }
        // If the user is entering edit mode, load the state of the Encounter
        SetLocalStringState1(activeEncounter?.Name || "");
        SetLocalStringState2(activeEncounter?.Metadata.Campaign || "");
        SetLocalStringState3(activeEncounter?.Description || "");
        SetBackupEncounter(activeEncounter ? activeEncounter.copy() : null);
    }

    /**
     * Save the Encounter to the API
     */
    const saveEncounter = (notify: boolean) => {
        if (!activeEncounter) return;
        let encs = encounters;
        api.saveEncounter("dummy", activeEncounter).then((res) => {
            if (!notify) return;
            if (res) {
                encs.splice(activeEncounterIndex, 1, res.toOverview());
                SetActiveEncounter(res, false);
                SetEncounters(encs);
                toast.success("Encounter saved successfully to server.");
            }
            else toast.error("Failed to save Encounter to server.");
        });
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
            SetEncounters([...encounters, activeEncounter.toOverview()]);
            SetIsNewEncounter(false);
        }
        SetBackupEncounter(null);
        updateMetadata({ Campaign: LocalStringState2 });
        SetActiveEncounter(activeEncounter.withName(LocalStringState1).withDescription(LocalStringState3).setInitiativeOrder());
        SetEditingEncounter(false);
        saveEncounter(true);
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
            return <StatBlockDisplay statBlock={item.Displayable as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={EditingEncounter ? 1 : Config.defaultColumns || 2} size={EditingEncounter ? "small" : "medium"} />;
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
        let ids = activeEncounter.InitiativeOrder.sort(Encounter.InitiativeSortKey);
        refs = new Map();
        return ids.map((id, ind) => {
            let ref = React.createRef<HTMLDivElement>();
            refs.set(id[0], ref);
            if (id[0] === `${activeEncounter.LairEntityName}_lair`) return <LairDisplay key={`${activeEncounter.LairEntityName}_lair${ind}`} ref={ref} lair={activeEncounter.Lair!} overviewOnly={overviewOnly} isActive={activeEncounter.ActiveID === `${activeEncounter.LairEntityName}_lair`} setDisplay={SetDisplayEntity} />;
            let entity = activeEncounter.Entities.find((ent) => ent.ID === id[0]);
            if (!entity) {
                console.log(activeEncounter.Entities, id);
                throw new Error("Entity not found in Encounter");
            }
            return <EntityDisplay key={`${entity.Name}${ind}`} ref={ref} entity={entity} deleteCallback={deleteEntity} setDisplay={SetDisplayEntity} renderTrigger={TriggerReRender} userOptions={{ conditions: Config.conditions }} overviewOnly={overviewOnly} editMode={EditingEncounter} isActive={entity.ID === activeEncounter.ActiveID} />;
        });
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
        // Check if entity is in the cache
        let entity = FullEntityList.find((ent) => ent.Name === entityName);
        // Entity is not in cache
        if (!entity) {
            getEntity(entityName).then((ent) => {
                if (ent) SetActiveEncounter(activeEncounter.addEntity(ent), false);
            });
        }
        // Entity is in cache
        else {
            if (entity.EntityType === EntityType.StatBlock) entity = new StatBlockEntity(entity.Displayable as StatBlock);
            SetActiveEncounter(activeEncounter.addEntity(entity), false);
        }
        TriggerReRender();
    }

    const startEncounter = () => {
        if (!activeEncounter) return;
        SetEncounterIsActive(true);
        let meta = activeEncounter.Metadata;
        if (!activeEncounter.Metadata.Started) {
            meta.Turn = 1;
            meta.Round = 1;
        }
        SetActiveEncounter(activeEncounter.setInitiativeOrder().withMetadata({ Started: true, AccessedDate: new Date(Date.now() - new Date().getTimezoneOffset()*60000), Turn: meta.Turn, Round: meta.Round }).copy(), runningEncounter);
        SetRunningEncounter(!runningEncounter);
        loadEncounterFromBackup();
        SetDisplayEntity(undefined);
    }

    const getEncounter = (id: number) => {
        api.getEncounter("dummy", id).then((res) => {
            if (!res.Encounter) return;
            SetActiveEncounter(res.Encounter.copy());
        });
    }

    /**
     * Scroll the entity list to the entity with the given ID
     * @param entityID The ID of the active entity
     */
    const ScrollToEntity = (entityID: string) => {
        if (!refs.has(entityID)) return;
        let ref = refs.get(entityID);
        if (ref && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    React.useEffect(() => {
        if (getEncountersRef.current === 0) {
            getEncountersRef.current = 1;
            api.getEncounters("dummy").then((res) => { SetEncounters(res.Encounters) });
        }
    }, [getEncountersRef]);

    // React.useEffect(() => {
    //     api.getConditions("dummy").then((res) => {
    //         let user = Config;
    //         user.conditions = res.Conditions;
    //         SetConfig(user);
    //     });
    // }, []); // TODO - when should this run?

    // React.useEffect(() => {
    //     getEntities(1);
    // }, []); // TODO - when should this run?

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
                    {(encounters ? encounters : []).map((encounter, ind) => {
                        return (
                            <tr key={`${encounter.Name}${ind}`}>
                                <td className="link"><a onClick={() => { getEncounter(encounter.id), SetActiveEncounterIndex(ind), SetEncounterIsActive(encounter.Metadata.Started || false) }}>{encounter.Name.replace(/\s/g, "").length > 0 ? encounter.Name : "<encounter name>"}</a></td>
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
                    <button onClick={() => { initializeStatesForEditing(), SetEditingEncounter(!EditingEncounter), updateMetadata({ AccessedDate: new Date() }), TriggerReRender() }} disabled={runningEncounter} >{EditingEncounter ? "Cancel" : "Edit Mode"}</button>
                    <button onClick={startEncounter} disabled={EditingEncounter} >{runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter</button>
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
                    {runningEncounter && <div id="EncounterRunControls">
                        <section>Round: {activeEncounter.Metadata.Round}</section>
                        <section>Turn: {activeEncounter.Metadata.Turn}</section>
                        <button onClick={() => { SetActiveEncounter(activeEncounter.tick(), activeEncounter.Metadata.Turn === 1), ScrollToEntity(activeEncounter.ActiveID), TriggerReRender() }}>NEXT</button>
                    </div>}
                    {!runningEncounter && <div id="EncounterEditControls">
                        <button onClick={() => { SetActiveEncounter(activeEncounter.randomizeInitiative()), TriggerReRender() }}>Random Initiative</button>
                        <button onClick={() => { SetActiveEncounter(activeEncounter.clear()), TriggerReRender() }} disabled={!EditingEncounter} >Clear Encounter</button>
                    </div>}
                </div>
                <div id="CreatureList" style={{ display: runningEncounter ? "none" : "block" }}>
                    {EditingEncounter && <EntityTable creatures={CreatureList} displayCallback={displayMiscEntity} addCallback={(name: string) => { addMiscEntity(name) }} />}
                </div>
                <div id="StatBlockDisplay" style={{ maxWidth: EditingEncounter ? "30%" : "55%", marginLeft: runningEncounter ? "2.5rem" : "0" }}>
                    {DisplayEntity && renderDisplay(DisplayEntity, !runningEncounter)}
                </div>
            </section>
            <ToastContainer position="top-right" />
            <LairDialog lairs={LairDialogList} visible={LairDialogVisible} onClose={() => { SetLairDialogVisible(false) }} ReturnLair={getLair} />
        </div>
    );
}