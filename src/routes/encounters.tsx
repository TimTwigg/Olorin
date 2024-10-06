import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { getEncounters } from "@src/controllers/api"
import { Encounter } from "@src/models/encounter"
import { EncounterDisplay } from "@src/components/encounterDisplay"

export const Route = createFileRoute("/encounters")({
    component: Encounters,
})

function Encounters() {
    const [encounters, setEncounters] = React.useState<Encounter[]>();

    React.useEffect(() => {
        getEncounters("dummy").then((res) => { setEncounters(res.Encounters) });
    }, [setEncounters])

    return (
        <>
            <h1>Encounters</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Encounters</h3>
                <button className="two columns">Create New Encounter</button>
            </div>
            <div className="break" />
            
        </>
    );
}