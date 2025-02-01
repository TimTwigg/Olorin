import * as React from "react";
import { Dialog } from "primereact/dialog";

import {
    GiCheckMark
} from "react-icons/gi";

import { Lair } from "@src/models/lair";
import "@src/styles/lair.scss";

export function LairDisplay({ name, lair }: { name: string, lair: Lair }) {
    if (!lair) return null;
    return (
        <div className="displayCard">
            <h4>{name}'s Lair</h4>
            <hr className="thin" />
            {lair.Description} <br />
            {lair.Actions && <>
                <h5>Lair Actions</h5>
                <hr />
                {lair.Actions.Description} <br />
                {lair.Actions.Items.map((a, k) => <ul key={k}>
                    <li>{a}</li>
                </ul>)}
            </>}
            {lair.RegionalEffects && <>
                <h5>Regional Effects</h5>
                <hr />
                {lair.RegionalEffects.Description} <br />
                {lair.RegionalEffects.Items.map((a, k) => <ul key={k}>
                    <li>{a}</li>
                </ul>)}
            </>}
        </div>
    );
}

type LairDialogProps = {
    visible: boolean;
    lairs: { Name: string, Lair: Lair }[];
    onClose: () => void;
    ReturnLair: (lair: Lair | undefined, Name: string) => void;
};

enum Code {
    OK,
    Cancel
}

export function LairDialog({ visible, lairs, onClose, ReturnLair }: LairDialogProps) {
    const [selectedLair, setSelectedLair] = React.useState<{ Name: string, Lair: Lair } | undefined>(undefined);
    const [radio_value, setRadioValue] = React.useState<string>("none");

    const return_lair = (code: Code) => {
        if (code === Code.OK) {
            if (selectedLair) {
                ReturnLair(selectedLair.Lair, selectedLair.Name);
            }
            else ReturnLair(undefined, "");
        }
        CloseDialog();
    };

    /**
     * Wrap the close function to allow adding cleanup functionality
     */
    const CloseDialog = () => {
        onClose();
    };

    const footer_content = (
        <div className="dialogButtons">
            <button onClick={() => return_lair(Code.Cancel)} >X Cancel</button>
            <button onClick={() => return_lair(Code.OK)} ><GiCheckMark /> OK</button>
        </div>
    );

    if (!visible || lairs.length === 0) return null;

    return (
        <Dialog header="Choose Lair" visible={visible} style={{ width: "50vw" }} onHide={CloseDialog} className="lairDialog" footer={footer_content}>
            <input type={"radio"} id={"lair_dialog_none"} name={"none"} value={"none"} checked={"none" === radio_value} onChange={() => { setRadioValue("none"), setSelectedLair(undefined) }} /><label htmlFor={"lair_dialog_none"}>None</label>
            {lairs.map((l, ind) => <section key={ind}><input type={"radio"} id={"lair_dialog" + l.Name} name={l.Name} value={l.Name} checked={l.Name === radio_value} onChange={() => { setRadioValue(l.Name), setSelectedLair(l) }} /><label htmlFor={"lair_dialog" + l.Name}>{l.Name}</label></section>)}
        </Dialog>
    );
}