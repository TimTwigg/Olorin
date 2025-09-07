import * as React from "react";
import { createFileRoute, useRouteContext, Link } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { AutoComplete } from "primereact/autocomplete";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

import * as api from "@src/controllers/api";
import { Encounter } from "@src/models/encounter";
import { EntityDisplay } from "@src/components/entityDisplay";
import { EntityOverview, EntityType } from "@src/models/entity";
import { StatBlockDisplay } from "@src/components/statBlockDisplay";
import { StatBlock } from "@src/models/statBlock";
import { Lair } from "@src/models/lair";
import { newLocalDate } from "@src/controllers/utils";
import { StatBlockEntity } from "@src/models/statBlockEntity";
import { LairDisplay, LairDialog, LairBlockDisplay } from "@src/components/lair";
import { EntityTable } from "@src/components/entityTable";
import { PlayerDialog } from "@src/components/playerDialog";

export const Route = createFileRoute("/encounters/$encounterID")({
    loader: async ({ params: { encounterID } }) => {
        let id = parseInt(encounterID);
        document.body.style.cursor = "wait";
        const activeEncounter =
            (await api
                .getEncounter(id)
                .then((res) => {
                    return res ? res.Encounter : null;
                })
                .catch(() => null)) || null;
        document.body.style.cursor = "default";
        return { activeEncounter };
    },
    component: ActiveEncounter,
});

function ActiveEncounter() {
    const [activeEncounter, _SetActiveEncounter] = React.useState<Encounter | null>(Route.useLoaderData().activeEncounter);

    if (!activeEncounter) {
        return <div>Loading...</div>;
    }

    const context = useRouteContext({ from: "__root__" });

    const [EditingEncounter, SetEditingEncounter] = React.useState<boolean>(false);
    const [runningEncounter, SetRunningEncounter] = React.useState<boolean>(false);
    const [EncounterIsActive, SetEncounterIsActive] = React.useState<boolean>(false);
    const [backupEncounter, SetBackupEncounter] = React.useState<Encounter | null>(null);
    const [DisplayEntityType, SetDisplayEntityType] = React.useState<"statblock" | "lair" | "">("");
    const [DisplayEntity, SetDisplayEntity] = React.useState<StatBlock | Lair | undefined>();
    const [CreatureList, SetCreatureList] = React.useState<EntityOverview[]>([]);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");
    const [campaignSelectionOptions, SetCampaignSelectionOptions] = React.useState<string[]>([]);
    const [LairDialogVisible, SetLairDialogVisible] = React.useState<boolean>(false);
    const [LairDialogList, SetLairDialogList] = React.useState<Lair[]>([]);
    const [dialogOptions, SetDialogOptions] = React.useState<DialogOptions>({
        visible: false,
        label: "",
        message: "",
        onHide: () => {},
        accept: () => {},
        reject: () => {},
    });
    const [FullStatBlockList, SetFullStatBlockList] = React.useState<StatBlock[]>([]);
    const [openPlayerDialog, SetOpenPlayerDialog] = React.useState<boolean>(false);
    var refs: Map<string, React.RefObject<HTMLDivElement>> = new Map();

    /**
     * Trigger a re-render of the Encounter Display.
     */
    async function TriggerReRender() {
        // This is a hack to force a re-render of the Encounter Display
        // React rerenders if a state changes
        if (activeEncounter) SetActiveEncounter(activeEncounter.copy(), false);
    }

    /** Set the active encounter locally, optionally saving it to the API.
     *
     * @param enc The encounter to set as active
     * @param save Whether to save the encounter to the API
     * @param notify Whether to notify the user of success/failure
     */
    const SetActiveEncounter = (enc: Encounter, save: boolean = true, notify: boolean = false) => {
        if (save) saveEncounter(notify);
        else _SetActiveEncounter(enc);
    };

    /**
     * Save the Encounter to the API
     */
    const saveEncounter = (notify: boolean) => {
        if (!activeEncounter) return;
        api.saveEncounter(activeEncounter).then((res) => {
            if (res) {
                SetActiveEncounter(res, false);
                if (notify) toast.success("Encounter saved successfully to server.");
            } else toast.error("Failed to save Encounter to server.");
        });
    };

    /**
     * Add an Entity to the Entity List. Manages caching of entities.
     *
     * @param entity The Entity to add to the list
     */
    const appendToStatBlockList = (statblock: StatBlock) => {
        let list = FullStatBlockList;
        let newLength = list.push(statblock);
        if (newLength > context.technicalConfig.cacheSizes.statblocks) list.shift();
        SetFullStatBlockList(list);
    };

    /**
     * Retrieve a StatBlock by its ID and add it to the page cache
     * @param entityID The ID of the StatBlock to retrieve
     * @returns The retrieved StatBlock, or undefined if not found
     */
    const getStatBlock = async (entityID: number): Promise<StatBlock | undefined> => {
        return api.getStatBlock(entityID).then((res) => {
            if (res.StatBlock === undefined) return;
            appendToStatBlockList(res.StatBlock);
            return res.StatBlock;
        });
    };

    /**
     * Delete an Entity from the Encounter
     * @param entityID The ID of the Entity to delete
     */
    const deleteEntity = (entityID: string) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.removeEntity(entityID).copy());
    };

    /**
     * Initialize the local states for editing an Encounter.
     *
     * Also resets the Encounter to its original state if the user cancels the edit.
     */
    const initializeStatesForEditing = () => {
        if (!activeEncounter) return;
        // If the user clicked cancel
        if (EditingEncounter) {
            // Reset the Encounter to its original state
            if (backupEncounter) {
                loadEncounterFromBackup();
            }
            // Clear the display
            SetDisplayEntity(undefined);
            return;
        } else {
            // load entities if needed
            if (CreatureList.length === 0) {
                api.getEntities(1, 1).then((res) => {
                    SetCreatureList(res.Entities as EntityOverview[]);
                });
            }
        }
        // If the user is entering edit mode, load the state of the Encounter
        SetLocalStringState1(activeEncounter.Name || "");
        SetLocalStringState2(activeEncounter.Metadata.Campaign || "");
        SetLocalStringState3(activeEncounter.Description || "");
        SetBackupEncounter(activeEncounter ? activeEncounter.copy() : null);
    };

    /**
     * Reset the active encounter to the backup encounter and clear the backup
     */
    const loadEncounterFromBackup = () => {
        if (!backupEncounter || !activeEncounter) return;
        SetActiveEncounter(activeEncounter.withEntities(backupEncounter.Entities).withLair(backupEncounter.Lair).setInitiativeOrder().copy(), false);
        SetBackupEncounter(null);
    };

    /**
     * Start the encounter
     */
    const startEncounter = () => {
        if (!activeEncounter) return;
        SetEncounterIsActive(true);
        let meta = activeEncounter.Metadata;
        if (!activeEncounter.Metadata.Started) {
            meta.Turn = 1;
            meta.Round = 1;
        }
        SetActiveEncounter(
            activeEncounter
                .setInitiativeOrder()
                .withMetadata({
                    Started: true,
                    AccessedDate: newLocalDate(),
                    Turn: meta.Turn,
                    Round: meta.Round,
                })
                .copy(),
            runningEncounter
        );
        SetRunningEncounter(!runningEncounter);
        loadEncounterFromBackup();
        SetDisplayEntity(undefined);
    };

    /**
     * Add a Miscellaneous Entity to the Encounter by its ID. Manages caching of entities.
     * @param entityID The ID of the entity to add
     */
    const addMiscEntity = (entityID: number, entityType: EntityType = EntityType.StatBlock) => {
        if (!activeEncounter) return;
        // Check if entity is in the cache
        let entity = FullStatBlockList.find((ent) => ent.ID === entityID);
        // Entity is not in cache
        if (!entity) {
            getStatBlock(entityID).then((statblock) => {
                if (statblock) SetActiveEncounter(activeEncounter.addEntity(new StatBlockEntity(statblock, (entityType = entityType))), false);
            });
        }
        // Entity is in cache
        else {
            SetActiveEncounter(activeEncounter.addEntity(new StatBlockEntity(entity, (entityType = entityType))), false);
        }
        TriggerReRender();
    };

    /**
     * Callback for LairDialog to return the selected Lair and set it on the Encounter.
     *
     * @param Lair The selected Lair to set on the Encounter
     */
    const getLair = (Lair: Lair | undefined) => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withLair(Lair));
    };

    /**
     * Save the changes made to the Encounter in Edit Mode. Also saves the Encounter to the API.
     */
    const saveEncounterChanges = () => {
        if (!activeEncounter) return;
        SetBackupEncounter(null);
        SetEditingEncounter(false);
        SetActiveEncounter(
            activeEncounter
                .withName(LocalStringState1)
                .withDescription(LocalStringState3)
                .withMetadata({
                    Campaign: LocalStringState2,
                    AccessedDate: newLocalDate(),
                })
                .setInitiativeOrder(),
            true,
            true
        );
    };

    /**
     * Add a Lair to the Encounter
     */
    const openLairDialog = () => {
        if (!activeEncounter) return;
        let lairs = activeEncounter.Entities.filter((ent) => ent instanceof StatBlockEntity && ent.StatBlock.Lair).map((ent) => {
            return (ent as StatBlockEntity).StatBlock.Lair!;
        });
        lairs = [...new Map(lairs.map((lair) => [lair.OwningEntityDBID, lair])).values()]; // Remove duplicates
        if (lairs.length === 0) {
            toast.error("No lairs found in Encounter");
            return;
        }
        SetLairDialogList(lairs);
        SetLairDialogVisible(true);
    };

    /**
     * Display an arbitrary type of entity in the StatBlockDisplay
     * @param entityID The ID of the entity to display
     */
    const displayMiscEntity = (entityID: number) => {
        let entity = FullStatBlockList.find((ent) => ent.ID === entityID);
        if (entity) {
            SetDisplayEntity(entity);
            SetDisplayEntityType("statblock");
        } else {
            getStatBlock(entityID).then((ent) => {
                if (ent) {
                    SetDisplayEntity(ent);
                    SetDisplayEntityType("statblock");
                }
            });
        }
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
            return <StatBlockDisplay statBlock={item as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={EditingEncounter ? 1 : context.userOptions.defaultColumns || 2} size={EditingEncounter ? "small" : "medium"} />;
        } else if (type == "lair") {
            return <LairBlockDisplay lair={item as Lair} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={overviewOnly ? 1 : context.userOptions.defaultColumns || 2} />;
        } else return <></>;
    };

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
            if (id[0] === `${activeEncounter.LairOwnerID}_lair`)
                return (
                    <LairDisplay
                        key={`${activeEncounter.LairOwnerID}_lair${ind}`}
                        ref={ref}
                        lair={activeEncounter.Lair!}
                        overviewOnly={overviewOnly}
                        isActive={activeEncounter.ActiveID === `${activeEncounter.LairOwnerID}_lair`}
                        setDisplay={(lair) => {
                            SetDisplayEntity(lair), SetDisplayEntityType("lair");
                        }}
                    />
                );
            let entity = activeEncounter.Entities.find((ent) => ent.ID === id[0]);
            if (!entity) {
                throw new Error("Entity not found in Encounter");
            }
            return (
                <EntityDisplay
                    key={`${entity.Name}${ind}`}
                    ref={ref}
                    entity={entity}
                    deleteCallback={deleteEntity}
                    setDisplay={(statblock) => {
                        SetDisplayEntity(statblock), SetDisplayEntityType("statblock");
                    }}
                    renderTrigger={TriggerReRender}
                    overviewOnly={overviewOnly}
                    editMode={EditingEncounter}
                    isActive={entity.ID === activeEncounter.ActiveID}
                />
            );
        });
    };

    /**
     * Scroll the entity list to the entity with the given ID
     * @param entityID The ID of the active entity
     */
    const ScrollToEntity = (entityID: string) => {
        if (!refs.has(entityID)) return;
        let ref = refs.get(entityID);
        if (ref && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <div className="playScreen container">
                <section className="justify-between">
                    <span className="three columns">
                        <Link to="/encounters">
                            <button className="big button">Back to Encounters</button>
                        </Link>
                    </span>
                    {EditingEncounter ? (
                        <span className="six columns titleEdit">
                            <input
                                type="text"
                                defaultValue={LocalStringState1}
                                placeholder="Name"
                                onChange={(e) => {
                                    SetLocalStringState1(e.target.value);
                                }}
                            />
                        </span>
                    ) : (
                        <h3 className="six columns">{activeEncounter.Name}</h3>
                    )}
                    <section className="three columns">
                        <span>
                            <strong>Created On:</strong> {activeEncounter.Metadata.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}
                        </span>
                        <br />
                        <span>
                            <strong>Campaign:</strong>{" "}
                            {EditingEncounter ? (
                                <AutoComplete
                                    value={LocalStringState2}
                                    onChange={(e) => {
                                        SetLocalStringState2(e.value);
                                    }}
                                    suggestions={campaignSelectionOptions}
                                    completeMethod={(e) => {
                                        SetCampaignSelectionOptions(context.campaigns.filter((c) => c.Name.toLowerCase().startsWith(e.query.toLowerCase())).map((c) => c.Name));
                                    }}
                                    placeholder="Campaign Name"
                                    dropdown
                                    forceSelection
                                />
                            ) : (
                                activeEncounter.Metadata.Campaign
                            )}
                        </span>
                    </section>
                </section>
                <div className="break" />
                <hr />
                {EditingEncounter ? (
                    <input
                        type="text"
                        className="ten columns descriptionEdit"
                        defaultValue={LocalStringState3}
                        placeholder="Encounter Description"
                        onChange={(e) => {
                            SetLocalStringState3(e.target.value);
                        }}
                    />
                ) : (
                    <p>{activeEncounter.Description}</p>
                )}
                <div className="break" />
                <hr />
                <section className="container">
                    <section id="buttonSet1" className="five columns">
                        <button
                            onClick={() => {
                                initializeStatesForEditing(), SetEditingEncounter(!EditingEncounter);
                            }}
                            disabled={runningEncounter}
                        >
                            {EditingEncounter ? "Cancel" : "Edit Mode"}
                        </button>
                        <button onClick={startEncounter} disabled={EditingEncounter}>
                            {runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter
                        </button>
                        <button
                            onClick={() => {
                                SetActiveEncounter(activeEncounter.reset(), true), SetEncounterIsActive(false); /*, TriggerReRender()*/
                            }}
                            disabled={runningEncounter || EditingEncounter}
                        >
                            Reset Encounter
                        </button>
                    </section>
                    <section id="mode-log">
                        <p>{EditingEncounter ? "Editing" : ""}</p>
                    </section>
                    <section id="buttonSet2" className="five columns">
                        <button onClick={saveEncounterChanges} disabled={!EditingEncounter}>
                            Save Changes
                        </button>
                        <button onClick={openLairDialog} disabled={!EditingEncounter}>
                            Set Lair
                        </button>
                        <button onClick={() => {SetOpenPlayerDialog(true)}} disabled={!EditingEncounter}>
                            Manage Players
                        </button>
                    </section>
                    <div className="break" />
                </section>
                <hr />

                <section className="panel">
                    <div>
                        {!runningEncounter && (
                            <div id="EncounterRunControls" className="small">
                                <section>Round: {activeEncounter.Metadata.Round}</section>
                                <section>Turn: {activeEncounter.Metadata.Turn}</section>
                            </div>
                        )}
                        <div id="EncounterList">{renderEntities(!runningEncounter)}</div>
                        {runningEncounter && (
                            <div id="EncounterRunControls">
                                <section>Round: {activeEncounter.Metadata.Round}</section>
                                <section>Turn: {activeEncounter.Metadata.Turn}</section>
                                <button
                                    onClick={() => {
                                        SetActiveEncounter(activeEncounter.tick(), activeEncounter.Metadata.Turn === 1), ScrollToEntity(activeEncounter.ActiveID), TriggerReRender();
                                    }}
                                >
                                    NEXT
                                </button>
                            </div>
                        )}
                        {!runningEncounter && (
                            <div id="EncounterEditControls">
                                <button
                                    onClick={() => {
                                        SetActiveEncounter(activeEncounter.randomizeInitiative(), false), TriggerReRender();
                                    }}
                                >
                                    Random Initiative
                                </button>
                                <button
                                    onClick={() => {
                                        SetActiveEncounter(activeEncounter.clear(), false), TriggerReRender();
                                    }}
                                    disabled={!EditingEncounter}
                                >
                                    Clear Encounter
                                </button>
                            </div>
                        )}
                    </div>
                    <div id="CreatureList" style={{ display: runningEncounter ? "none" : "block" }}>
                        {EditingEncounter && (
                            <EntityTable
                                creatures={CreatureList}
                                displayCallback={displayMiscEntity}
                                addCallback={(id: number) => {
                                    addMiscEntity(id);
                                }}
                            />
                        )}
                    </div>
                    <div
                        id="StatBlockDisplay"
                        style={{
                            maxWidth: EditingEncounter ? "30%" : "55%",
                            marginLeft: runningEncounter ? "2.5rem" : "0",
                        }}
                    >
                        {DisplayEntity && DisplayEntityType && renderDisplay(DisplayEntity, DisplayEntityType, !runningEncounter)}
                    </div>
                </section>
                <LairDialog
                    lairs={LairDialogList}
                    selectedOwningEntityDBID={activeEncounter.HasLair ? activeEncounter.Lair!.OwningEntityDBID : -1}
                    visible={LairDialogVisible}
                    onClose={() => {
                        SetLairDialogVisible(false);
                    }}
                    ReturnLair={getLair}
                />
            </div>
            <ConfirmDialog
                visible={dialogOptions.visible}
                onHide={() => {
                    SetDialogOptions({ ...dialogOptions, visible: false }), dialogOptions.onHide();
                }}
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
            <PlayerDialog
                visible={openPlayerDialog}
                campaign={activeEncounter.Metadata.Campaign || ""}
                currentPlayersIDs={activeEncounter.Entities.filter((ent) => ent.EntityType === EntityType.Player).map((ent) => ent.DBID)}
                onClose={() => SetOpenPlayerDialog(false)}
                callback={(ids) => {
                    ids.forEach((playerID) => {
                        addMiscEntity(playerID, EntityType.Player);
                    });
                }}
            />
        </SessionAuth>
    );
}
