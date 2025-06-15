import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ToastContainer, toast } from "react-toastify";
import { ConfirmDialog } from "primereact/confirmdialog";
import { IoWarningSharp } from "react-icons/io5";

import * as api from "@src/controllers/api";
import { Encounter, EncounterMetadata, EncounterOverview } from "@src/models/encounter";
import { EntityDisplay } from "@src/components/entityDisplay";
import { EntityOverview } from "@src/models/entity";
import { StatBlockDisplay } from "@src/components/statBlockDisplay";
import { StatBlock } from "@src/models/statBlock";
import { Lair } from "@src/models/lair";
import { UserOptions } from "@src/models/userOptions";
import { newLocalDate } from "@src/controllers/utils";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { LairDisplay, LairDialog, LairBlockDisplay } from "@src/components/lair";
import { EntityTable } from "@src/components/entityTable";
import { EncountersTable } from "@src/components/encountersTable";

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

type DialogOptions = {
    visible: boolean,
    label: string,
    message: string,
    onHide: () => void,
    accept: () => void,
    reject: () => void,
    defaultFocus?: "accept" | "reject" | undefined,
    icon?: React.ReactNode,
}

/**
 * Cache Size for Entities List
 */
const CACHESIZE = 100;

function Encounters() {
    const [encounters, SetEncounters] = React.useState<EncounterOverview[]>([]);
    const [activeEncounter, _SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [backupEncounter, SetBackupEncounter] = React.useState<Encounter | null>(null);
    const [runningEncounter, SetRunningEncounter] = React.useState<boolean>(false);
    const [DisplayEntity, SetDisplayEntity] = React.useState<StatBlock | Lair | undefined>();
    const [DisplayEntityType, SetDisplayEntityType] = React.useState<"statblock" | "lair" | "">("");
    const [Config, SetConfig] = React.useState<UserOptions>(new UserOptions());
    const [EncounterIsActive, SetEncounterIsActive] = React.useState<boolean>(false);
    const [EditingEncounter, SetEditingEncounter] = React.useState<boolean>(false);
    const [IsNewEncounter, SetIsNewEncounter] = React.useState<boolean>(false);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");
    const [CreatureList, SetCreatureList] = React.useState<EntityOverview[]>([]);
    const [FullStatBlockList, SetFullStatBlockList] = React.useState<StatBlock[]>([]);
    const [LairDialogVisible, SetLairDialogVisible] = React.useState<boolean>(false);
    const [LairDialogList, SetLairDialogList] = React.useState<Lair[]>([]);
    const getEncountersRef = React.useRef(0);
    const getConditionsRef = React.useRef(0);
    const [dialogOptions, SetDialogOptions] = React.useState<DialogOptions>({ visible: false, label: "", message: "", onHide: () => { }, accept: () => { }, reject: () => { } });

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
    const appendToStatBlockList = (statblock: StatBlock) => {
        let list = FullStatBlockList;
        let newLength = list.push(statblock);
        if (newLength > CACHESIZE) list.shift();
        SetFullStatBlockList(list);
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
        api.getEncounters().then((res) => { SetEncounters(res.Encounters) });
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
        enc.Metadata.CreationDate = newLocalDate();
        enc.Metadata.AccessedDate = newLocalDate();
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
            .withLair(backupEncounter.Lair)
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
        else {
            // load entities if needed
            if (CreatureList.length === 0) {
                api.getEntities(1, 1).then((res) => {
                    SetCreatureList(res.Entities as EntityOverview[]);
                });
            }
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
        api.saveEncounter(activeEncounter).then((res) => {
            if (res) {
                if (IsNewEncounter) {
                    encs.push(res.toOverview());
                    SetIsNewEncounter(false);
                }
                SetActiveEncounter(res, false);
                SetEncounters(encs);
                if (notify) toast.success("Encounter saved successfully to server.");
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
        }
        SetBackupEncounter(null);
        updateMetadata({ Campaign: LocalStringState2, AccessedDate: newLocalDate() });
        SetActiveEncounter(activeEncounter.withName(LocalStringState1).withDescription(LocalStringState3).setInitiativeOrder());
        SetEditingEncounter(false);
        saveEncounter(true);
    }

    /**
     * Add a Lair to the Encounter
     */
    const openLairDialog = () => {
        if (!activeEncounter) return;
        let lairs = activeEncounter.Entities.filter((ent) => ent instanceof StatBlockEntity && ent.StatBlock.Lair).map((ent) => { return (ent as StatBlockEntity).StatBlock.Lair! });
        lairs = [...new Map(lairs.map((lair) => [lair.OwningEntityDBID, lair])).values()]; // Remove duplicates
        if (lairs.length === 0) {
            toast.error("No lairs found in Encounter");
            return;
        }
        SetLairDialogList(lairs);
        SetLairDialogVisible(true);
    }

    const getLair = (Lair: Lair | undefined) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withLair(Lair));
    };

    /**
     * Render the StatBlock or Lair in the Display
     * 
     * @param item The StatBlock or Lair to render
     * @param overviewOnly Whether or not to render the full display
     */
    const renderDisplay = (item: StatBlock | Lair | undefined, type: "statblock" | "lair", overviewOnly: boolean = false) => {
        if (!item) return <></>;
        if (type == "statblock") {
            return <StatBlockDisplay statBlock={item as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={EditingEncounter ? 1 : Config.defaultColumns || 2} size={EditingEncounter ? "small" : "medium"} />;
        }
        else if (type == "lair") {
            return <LairBlockDisplay lair={item as Lair} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={overviewOnly ? 1 : Config.defaultColumns || 2} />;
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
            if (id[0] === `${activeEncounter.LairOwnerID}_lair`) return <LairDisplay key={`${activeEncounter.LairOwnerID}_lair${ind}`} ref={ref} lair={activeEncounter.Lair!} overviewOnly={overviewOnly} isActive={activeEncounter.ActiveID === `${activeEncounter.LairOwnerID}_lair`} setDisplay={(lair) => { SetDisplayEntity(lair), SetDisplayEntityType("lair") }} />;
            let entity = activeEncounter.Entities.find((ent) => ent.ID === id[0]);
            if (!entity) {
                throw new Error("Entity not found in Encounter");
            }
            return <EntityDisplay key={`${entity.Name}${ind}`} ref={ref} entity={entity} deleteCallback={deleteEntity} setDisplay={(statblock) => { SetDisplayEntity(statblock), SetDisplayEntityType("statblock") }} renderTrigger={TriggerReRender} userOptions={{ conditions: Config.conditions }} overviewOnly={overviewOnly} editMode={EditingEncounter} isActive={entity.ID === activeEncounter.ActiveID} />;
        });
    }

    const getStatBlock = async (entityID: number): Promise<StatBlock | undefined> => {
        return api.getStatBlock(entityID).then((res) => {
            if (res.StatBlock === undefined) return;
            appendToStatBlockList(res.StatBlock);
            return res.StatBlock;
        });
    }

    const displayMiscEntity = (entityID: number) => {
        let entity = FullStatBlockList.find((ent) => ent.ID === entityID);
        if (entity) {
            SetDisplayEntity(entity);
            SetDisplayEntityType("statblock");
        }
        else {
            getStatBlock(entityID).then((ent) => {
                if (ent) {
                    SetDisplayEntity(ent);
                    SetDisplayEntityType("statblock");
                }
            });
        }
    }

    const addMiscEntity = (entityID: number) => {
        if (!activeEncounter) return;
        // Check if entity is in the cache
        let entity = FullStatBlockList.find((ent) => ent.ID === entityID);
        // Entity is not in cache
        if (!entity) {
            getStatBlock(entityID).then((statblock) => {
                if (statblock) SetActiveEncounter(activeEncounter.addEntity(new StatBlockEntity(statblock)), false);
            });
        }
        // Entity is in cache
        else {
            SetActiveEncounter(activeEncounter.addEntity(new StatBlockEntity(entity)), false);
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
        SetActiveEncounter(activeEncounter.setInitiativeOrder().withMetadata({ Started: true, AccessedDate: newLocalDate(), Turn: meta.Turn, Round: meta.Round }).copy(), runningEncounter);
        SetRunningEncounter(!runningEncounter);
        loadEncounterFromBackup();
        SetDisplayEntity(undefined);
    }

    const getEncounter = (id: number) => {
        api.getEncounter(id).then((res) => {
            if (!res.Encounter) return;
            SetActiveEncounter(res.Encounter.copy());
        });
    }

    const selectEncounter = (encounter: EncounterOverview) => {
        getEncounter(encounter.id);
        SetEncounterIsActive(encounter.Metadata.Started || false);
    }

    const deleteEncounter = (encounter: EncounterOverview) => {
        SetDialogOptions({
            visible: true,
            label: "Delete Encounter",
            message: `Are you sure you want to delete the encounter "${encounter.Name}"?`,
            onHide: () => { SetDialogOptions({ ...dialogOptions, visible: false }) },
            accept: () => {
                api.deleteEncounter(encounter.id).then((res: boolean) => {
                    if (res) {
                        window.location.reload();
                        toast.success("Encounter deleted successfully.");
                    }
                    else {
                        toast.error("Failed to delete Encounter.");
                    }
                })
            },
            reject: () => { },
            defaultFocus: "reject",
            icon: <IoWarningSharp />,
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
            api.getEncounters().then((res) => { SetEncounters(res.Encounters) });
        }
    }, [getEncountersRef]);

    React.useEffect(() => {
        if (getConditionsRef.current === 0) {
            getConditionsRef.current = 1;
            api.getConditions().then((res) => {
                let user = Config;
                user.conditions = res.Conditions;
                SetConfig(user);
            });
        }
    }, [getConditionsRef]);

    // Encounters Overview
    if (!activeEncounter) return (
        <>
            <h1>Encounters</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Encounters</h3>
                <button className="two columns" onClick={createNewEncounter}>Create New Encounter</button>
            </div>
            <div className="break" />
            <EncountersTable encounters={encounters} className="ten columns offset-by-one column" nameCallback={selectEncounter} deleteCallback={deleteEncounter} />
            <ToastContainer position="top-right" />
            <ConfirmDialog
                visible={dialogOptions.visible}
                onHide={() => { SetDialogOptions({ ...dialogOptions, visible: false }), dialogOptions.onHide() }}
                header={dialogOptions.label}
                message={dialogOptions.message}
                className="dialog"
                focusOnShow={true}
                accept={dialogOptions.accept}
                reject={dialogOptions.reject}
                defaultFocus={dialogOptions.defaultFocus}
                icon={dialogOptions.icon}
                modal={true}
                acceptClassName="dialog-accept"
                rejectClassName="dialog-reject"
                maskClassName="dialog-mask"
                headerClassName="dialog-header"
                contentClassName="dialog-content"
            />
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
                    <button onClick={() => { initializeStatesForEditing(), SetEditingEncounter(!EditingEncounter), TriggerReRender() }} disabled={runningEncounter} >{EditingEncounter ? "Cancel" : "Edit Mode"}</button>
                    <button onClick={startEncounter} disabled={EditingEncounter} >{runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter</button>
                    <button onClick={() => { SetActiveEncounter(activeEncounter.reset(), true), SetEncounterIsActive(false), TriggerReRender() }} disabled={runningEncounter || EditingEncounter} >Reset Encounter</button>
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
                    {!runningEncounter && <div id="EncounterRunControls" className="small">
                        <section>Round: {activeEncounter.Metadata.Round}</section>
                        <section>Turn: {activeEncounter.Metadata.Turn}</section>
                    </div>}
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
                    {EditingEncounter && <EntityTable creatures={CreatureList} displayCallback={displayMiscEntity} addCallback={(id: number) => { addMiscEntity(id) }} />}
                </div>
                <div id="StatBlockDisplay" style={{ maxWidth: EditingEncounter ? "30%" : "55%", marginLeft: runningEncounter ? "2.5rem" : "0" }}>
                    {DisplayEntity && DisplayEntityType && renderDisplay(DisplayEntity, DisplayEntityType, !runningEncounter)}
                </div>
            </section>
            <ToastContainer position="top-right" />
            <ConfirmDialog
                visible={dialogOptions.visible}
                onHide={() => { SetDialogOptions({ ...dialogOptions, visible: false }), dialogOptions.onHide() }}
                header={dialogOptions.label}
                message={dialogOptions.message}
                className="dialog"
                focusOnShow={true}
                accept={dialogOptions.accept}
                reject={dialogOptions.reject}
                defaultFocus={dialogOptions.defaultFocus}
                icon={dialogOptions.icon}
                modal={true}
                acceptClassName="dialog-accept"
                rejectClassName="dialog-reject"
                maskClassName="dialog-mask"
                headerClassName="dialog-header"
                contentClassName="dialog-content"
            />
            <LairDialog lairs={LairDialogList} selectedOwningEntityDBID={activeEncounter.HasLair ? activeEncounter.Lair!.OwningEntityDBID : -1} visible={LairDialogVisible} onClose={() => { SetLairDialogVisible(false) }} ReturnLair={getLair} />
        </div>
    );
}