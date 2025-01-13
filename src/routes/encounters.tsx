import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import * as api from "@src/controllers/api"
import { Encounter, EncounterMetadata } from "@src/models/encounter"
import { EntityDisplay } from "@src/components/entityDisplay"
import { Entity, EntityOverview, EntityType } from "@src/models/entity"
import { StatBlockDisplay } from "@src/components/statBlockDisplay"
import { StatBlock } from "@src/models/statBlock"
import { UserOptions } from "@src/models/userOptions"

import { FaAddressCard } from "react-icons/fa"
import { StatBlockEntity } from "@src/models/statBlockEntity"

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

const CACHESIZE = 100;

function Encounters() {
    const [encounters, SetEncounters] = React.useState<Encounter[]>([]);
    const [activeEncounter, SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [runningEncounter, SetRunningEncounter] = React.useState<boolean>(false);
    const [DisplayEntity, SetDisplayEntity] = React.useState<Entity | undefined>();
    const [RenderTrigger, SetRenderTrigger] = React.useState<boolean>(true);
    const [Config, SetConfig] = React.useState<UserOptions>(new UserOptions());
    const [EncounterIsActive, SetEncounterIsActive] = React.useState<boolean>(false);
    const [EditingEncounter, SetEditingEncounter] = React.useState<boolean>(false);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");
    const [CreatureList, SetCreatureList] = React.useState<EntityOverview[]>([]);
    const [FullEntityList, SetFullEntityList] = React.useState<Entity[]>([]);

    const appendToEntityList = (entity: Entity) => {
        let list = FullEntityList;
        let newLength = list.push(entity);
        if (newLength > CACHESIZE) list.shift();
        SetFullEntityList(list);
    }

    async function TriggerReRender() {
        SetRenderTrigger(false);
        setTimeout(() => SetRenderTrigger(true), 1);
    }

    const resetAllStates = () => {
        SetActiveEncounter(null);
        SetRunningEncounter(false);
        SetDisplayEntity(undefined);
        SetEncounterIsActive(false);
        SetEditingEncounter(false);
    }

    const deleteEntity = (entityID: string) => {
        if (!activeEncounter) return;
        let entities = activeEncounter.Entities;
        entities = entities.filter((ent) => ent.id !== entityID);
        activeEncounter.Entities = entities;
        SetActiveEncounter(activeEncounter);
        TriggerReRender();
    }

    const updateMetadata = (data: EncounterMetadata) => {
        if (!activeEncounter) return;
        let enc = activeEncounter;
        enc.Metadata = {
            CreationDate: data.CreationDate === undefined ? enc.Metadata.CreationDate : data.CreationDate,
            AccessedDate: data.AccessedDate === undefined ? enc.Metadata.AccessedDate : data.AccessedDate,
            Campaign: data.Campaign === undefined ? enc.Metadata.Campaign : data.Campaign,
            Started: data.Started === undefined ? enc.Metadata.Started : data.Started,
        }
        SetActiveEncounter(enc);
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
        SetEncounters([...encounters, enc]); // this needs to happen only when save button is used.
    }

    const initializeStatesForEditing = () => {
        if (EditingEncounter) return;
        SetLocalStringState1(activeEncounter?.Name || "");
        SetLocalStringState2(activeEncounter?.Metadata.Campaign || "");
        SetLocalStringState3(activeEncounter?.Description || "");
    }

    const saveEncounterChanges = () => {
        if (!activeEncounter) return;
        SetActiveEncounter(activeEncounter.withName(LocalStringState1));
        updateMetadata({ Campaign: LocalStringState2 });
        SetActiveEncounter(activeEncounter.withDescription(LocalStringState3));
        SetEditingEncounter(false);
    }

    const renderDisplayEntity = (ent?: Entity, overviewOnly: boolean = false) => {
        if (!ent) return <></>;
        else if (ent.EntityType === EntityType.StatBlock) return <StatBlockDisplay statBlock={ent.Displayable as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} displayColumns={overviewOnly ? 1 : Config.defaultColumns || 2} />;
        else if (ent.EntityType === EntityType.Player) return <></>;
        else return <></>;
    }

    const renderEntities = (overviewOnly: boolean) => {
        let entities = activeEncounter?.Entities || [];
        entities.sort((a, b) => b.Initiative - a.Initiative);
        return entities.map((entity, ind) => <EntityDisplay key={`${entity.Name}${ind}`} entity={entity} deleteCallback={deleteEntity} setDisplay={SetDisplayEntity} renderTrigger={TriggerReRender} userOptions={{ conditions: Config.conditions }} overviewOnly={overviewOnly} editMode={EditingEncounter} />);
    }

    const getEntities = (page: number) => {
        api.getEntities("dummy", page, 1).then((res) => {
            SetCreatureList(res.Entities.map(e => e as EntityOverview));
        });
    }

    const getEntity = (entityName: string): Promise<Entity | undefined> => {
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
                <span className="three columns"><button className="big button" onClick={() => { resetAllStates() }}>Back to Encounters</button></span>
                {EditingEncounter ?
                    <span className="six columns titleEdit"><input type="text" defaultValue={LocalStringState1} onChange={(e) => { SetLocalStringState1(e.target.value) }} /></span>
                    :
                    <h3 className="six columns">{activeEncounter.Name}</h3>
                }
                <section className="three columns">
                    <span><strong>Created On:</strong> {activeEncounter.Metadata.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</span><br />
                    <span><strong>Campaign:</strong> {EditingEncounter ? <input type="text" defaultValue={LocalStringState2} onChange={e => { SetLocalStringState2(e.target.value) }} /> : activeEncounter.Metadata.Campaign}</span>
                </section>
            </section>
            <div className="break" />
            <hr />
            {EditingEncounter ?
                <input type="text" className="ten columns descriptionEdit" defaultValue={LocalStringState3} onChange={(e) => { SetLocalStringState3(e.target.value) }} />
                :
                <p>{activeEncounter.Description}</p>
            }
            <div className="break" />
            <hr />
            <section className="container">
                <section id="buttonSet1" className="five columns">
                    <button onClick={() => { initializeStatesForEditing(), SetEditingEncounter(!EditingEncounter), updateMetadata({ AccessedDate: new Date() }) }} disabled={runningEncounter} >{EditingEncounter ? "Cancel" : "Edit Mode"}</button>
                    <button onClick={() => { SetRunningEncounter(!runningEncounter), SetEncounterIsActive(true), updateMetadata({ Started: true, AccessedDate: new Date() }), TriggerReRender() }} disabled={EditingEncounter} >{runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter</button>
                    <button onClick={() => { SetActiveEncounter(activeEncounter.reset()), SetEncounterIsActive(false), TriggerReRender() }} disabled={runningEncounter} >Reset Encounter</button>
                </section>
                <section id="mode-log">
                    <p>{EditingEncounter ? "Editing" : ""}</p>
                </section>
                <section id="buttonSet2" className="five columns">
                    <button onClick={saveEncounterChanges} disabled={!EditingEncounter} >Save Changes</button>
                    <button onClick={() => { }} disabled={!EditingEncounter} >Add Creature</button>
                    <button onClick={() => { }} disabled={!EditingEncounter} >Add Player</button>
                </section>
                <div className="break" />
            </section>
            <hr />
            <section className="panel">
                <div id="EncounterList">
                    {RenderTrigger && renderEntities(!runningEncounter)}
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
                <div id="StatBlockDisplay" style={{ maxWidth: runningEncounter ? "none" : "30%", margin: runningEncounter ? "0 10rem" : "0" }}>
                    {DisplayEntity && renderDisplayEntity(DisplayEntity, !runningEncounter)}
                </div>
            </section>
        </div>
    );
}