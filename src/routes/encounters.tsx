import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { getEncounters } from "@src/controllers/api"
import { Encounter } from "@src/models/encounter"
import { EntityDisplay } from "@src/components/entityDisplay"
import { Entity, EntityType } from "@src/models/entity"
import { StatBlockDisplay } from "@src/components/statBlockDisplay"
import { StatBlock } from "@src/models/statBlock"

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

function Encounters() {
    const [encounters, SetEncounters] = React.useState<Encounter[]>([]);
    const [activeEncounter, SetActiveEncounter] = React.useState<Encounter | null>(null);
    const [DisplayEntity, SetDisplayEntity] = React.useState<Entity | undefined>();

    const renderDisplayEntity = (ent?: Entity) => {
        if (!ent) return <></>;
        else if (ent.EntityType === EntityType.StatBlock) return <StatBlockDisplay statBlock={ent.Displayable as StatBlock} deleteCallback={() => SetDisplayEntity(undefined)} />;
        else if (ent.EntityType === EntityType.Player) return <></>;
        else return <></>;
    }

    React.useEffect(() => {
        getEncounters("dummy").then((res) => { SetEncounters(res.Encounters) });
    }, [SetEncounters])

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
                    </tr>
                </thead>
                <tbody>
                    {encounters?.map((encounter, ind) => {
                        return (
                            <tr key={`${encounter.Name}${ind}`}>
                                <td className="link"><a onClick={() => SetActiveEncounter(encounter)}>{encounter.Name}</a></td>
                                <td>{encounter.Description}</td>
                                <td>{encounter.Metadata.Campaign}</td>
                                <td>{encounter.Metadata.CreationDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
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
            <span className="three columns"><button className="big button" onClick={() => SetActiveEncounter(null)}>Back to Encounters</button></span>
            <h3 className="seven columns">{activeEncounter.Name}</h3>
            <section className="two columns">
                <span><strong>Created On:</strong> {activeEncounter.Metadata.CreationDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span><br />
                <span><strong>Campaign</strong> {activeEncounter.Metadata.Campaign}</span>
            </section>
            <div className="break" />
            <hr />
            <p>{activeEncounter.Description}</p>
            <hr />
            <div className="five columns">
                {activeEncounter.Entities.map((entity, ind) => <EntityDisplay key={`${entity.Name}${ind}`} entity={entity} deleteCallback={() => { }} setDisplay={SetDisplayEntity} />)}
            </div>
            <div className="seven columns">
                {DisplayEntity && renderDisplayEntity(DisplayEntity)}
            </div>
        </div>
    );
}