import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { EntityDisplay } from "@src/components/entityDisplay"
import { StatBlockEntity } from "@src/models/statBlockEntity"

import { arasta } from "@src/temp/arasta"
import { aurelia } from "@src/temp/aurelia"
import { winter_ghoul } from "@src/temp/winter-ghoul"
import { conditions } from "@src/temp/conditions"
import { Entity, EntityType } from "@src/models/entity"
import { StatBlockDisplay } from "@src/components/statBlockDisplay"
import { StatBlock } from "@src/models/statBlock"

export const Route = createFileRoute("/library")({
    component: Library,
})

function renderDisplayEntity(ent?: Entity): JSX.Element {
    if (!ent) return <></>;
    else if (ent.EntityType === EntityType.StatBlock) return <StatBlockDisplay statBlock={ent.Displayable as StatBlock} />;
    else if (ent.EntityType === EntityType.Player) return <></>;
    else return <></>;
}

function Library() {
    const [DisplayEntity, SetDisplayEntity] = React.useState<Entity | undefined>();

    return (
        <>
            <p>
                This is the library.
            </p>
            {renderDisplayEntity(DisplayEntity)}

            <EntityDisplay entity={new StatBlockEntity(arasta, 5)} deleteCallback={() => { console.log(`Delete ${arasta.Name}`) }} expanded={true} userOptions={{ conditions: conditions }} setDisplay={SetDisplayEntity} />
            <EntityDisplay entity={new StatBlockEntity(aurelia, 5)} deleteCallback={() => { }} setDisplay={SetDisplayEntity} />
            <EntityDisplay entity={new StatBlockEntity(winter_ghoul, 5)} deleteCallback={() => { }} setDisplay={SetDisplayEntity} />
        </>
    )
}
