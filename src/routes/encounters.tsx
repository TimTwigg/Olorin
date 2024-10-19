import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import * as api from "@src/controllers/api"
import { Encounter, EncounterMetadata } from "@src/models/encounter"
import { EntityDisplay } from "@src/components/entityDisplay"
import { Entity, EntityType } from "@src/models/entity"
import { StatBlockDisplay } from "@src/components/statBlockDisplay"
import { StatBlock } from "@src/models/statBlock"
import { UserOptions } from "@src/models/userOptions"

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

function Encounters() {
    const [encounters, SetEncounters] = React.useState<Encounter[]>([]);
    const [activeEncounter, SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [runningEncounter, SetRunningEncounter] = React.useState<boolean>(false);
    const [DisplayEntity, SetDisplayEntity] = React.useState<Entity | undefined>();
    const [RenderTrigger, SetRenderTrigger] = React.useState<boolean>(true);
    const [Config, SetConfig] = React.useState<UserOptions>(new UserOptions());
    const [EncounterIsActive, SetEncounterIsActive] = React.useState<boolean>(false);
    const [EditingEncounter, SetEditingEncounter] = React.useState<boolean>(false);

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

    const renderDisplayEntity = (ent?: Entity) => {
        if (!ent) return <></>;
        else if (ent.EntityType === EntityType.StatBlock) return <StatBlockDisplay statBlock={ent.Displayable as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} />;
        else if (ent.EntityType === EntityType.Player) return <></>;
        else return <></>;
    }

    const renderEntities = (overviewOnly: boolean) => {
        let entities = activeEncounter?.Entities || [];
        entities.sort((a, b) => b.Initiative - a.Initiative);
        return entities.map((entity, ind) => <EntityDisplay key={`${entity.Name}${ind}`} entity={entity} deleteCallback={deleteEntity} setDisplay={SetDisplayEntity} renderTrigger={TriggerReRender} userOptions={{ conditions: Config.conditions }} overviewOnly={overviewOnly} />);
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

    // Encounters Overview
    if (!activeEncounter) return (
        <>
            <h1>Encounters</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Encounters</h3>
                <button className="two columns">Create New Encounter</button>
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
                                <td className="link"><a onClick={() => { SetActiveEncounter(encounter), SetEncounterIsActive(encounter.Metadata.Started || false) }}>{encounter.Name}</a></td>
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
            <span className="three columns"><button className="big button" onClick={() => { resetAllStates() }}>Back to Encounters</button></span>
            <h3 className="seven columns">{activeEncounter.Name}</h3>
            <section className="two columns">
                <span><strong>Created On:</strong> {activeEncounter.Metadata.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</span><br />
                <span><strong>Campaign:</strong> {activeEncounter.Metadata.Campaign}</span>
            </section>
            <div className="break" />
            <hr />
            <p>{activeEncounter.Description}</p>
            <hr />
            <section className="container">
                <section id="buttonSet1" className="five columns">
                    <button onClick={() => { SetEditingEncounter(!EditingEncounter) }} disabled={runningEncounter} >{EditingEncounter ? "Save Changes" : "Edit Mode"}</button>
                    <button onClick={() => { SetRunningEncounter(!runningEncounter), SetEncounterIsActive(true), updateMetadata({ Started: true }), TriggerReRender() }} disabled={EditingEncounter} >{runningEncounter ? "Pause" : EncounterIsActive ? "Resume" : "Start"} Encounter</button>
                    <button onClick={() => { SetActiveEncounter(activeEncounter.reset()), SetEncounterIsActive(false), TriggerReRender() }} disabled={runningEncounter} >Reset Encounter</button>
                </section>
                <section id="mode-log">
                    <p>{EditingEncounter?"Editing":""}</p>
                </section>
                <section id="buttonSet2" className="five columns">
                    <button onClick={() => { SetEditingEncounter(false) }} disabled={!EditingEncounter} ></button>
                    <button onClick={() => { }} disabled={!EditingEncounter} >Add Entity</button>
                    <button onClick={() => { }} disabled={!EditingEncounter} ></button>
                </section>
                <div className="break" />
            </section>
            <hr />
            <section className="panel">
                <div>
                    {RenderTrigger && renderEntities(!runningEncounter)}
                </div>
                <div>
                    {DisplayEntity && renderDisplayEntity(DisplayEntity)}
                </div>
            </section>
        </div>
    );
}