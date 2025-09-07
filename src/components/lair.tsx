import * as React from "react";
import { Dialog } from "primereact/dialog";

import { GiCheckMark } from "react-icons/gi";
import { FaAddressCard } from "react-icons/fa";

import { Lair } from "@src/models/lair";
import "@src/styles/lair.scss";

type LairProps = {
    ref?: React.RefObject<HTMLDivElement>;
    lair: Lair;
    overviewOnly?: boolean;
    isActive?: boolean;
    setDisplay?: (lair?: Lair) => void;
};

export function LairDisplay({ ref, lair, overviewOnly, isActive, setDisplay }: LairProps) {
    setDisplay =
        setDisplay ||
        ((lair?: Lair) => {
            console.log(`No display callback found for entity: ${lair ? lair.Name : "undefined"}`);
        });
    return (
        <div ref={ref} className={"lair" + (overviewOnly ? " overview" : "") + (!overviewOnly && isActive ? " active" : "")}>
            <div className="displayCardInfo">
                <section>{lair.Initiative}</section>
            </div>
            <div className="displayCard">
                <h4>{lair.Name}'s Lair</h4>
                <button onClick={() => setDisplay(lair)} title="Display">
                    <FaAddressCard />
                </button>
            </div>
        </div>
    );
}

type LairBlockProps = {
    lair: Lair;
    displayColumns?: number;
    deleteCallback?: () => void;
};

export function LairBlockDisplay({ lair, displayColumns, deleteCallback }: LairBlockProps) {
    const dynamicStyles: React.CSSProperties = {
        columnCount: displayColumns || 2,
    };
    return (
        <div className="statblock displayCard" style={dynamicStyles}>
            {deleteCallback && (
                <button className="delete button" onClick={deleteCallback}>
                    X
                </button>
            )}
            <h4>{lair.Name}'s Lair</h4>
            <hr className="thin" />
            {lair.Description} <br />
            {lair.Actions && (
                <>
                    <h5>Lair Actions</h5>
                    <hr />
                    {lair.Actions.Description} <br />
                    {lair.Actions.Items.map((a, k) => (
                        <ul key={k}>
                            <li>
                                <b>{a.Name}</b> {a.Description}
                            </li>
                        </ul>
                    ))}
                </>
            )}
            {lair.RegionalEffects && (
                <>
                    <h5>Regional Effects</h5>
                    <hr />
                    {lair.RegionalEffects.Description} <br />
                    {lair.RegionalEffects.Items.map((a, k) => (
                        <ul key={k}>
                            <li>
                                <b>{a.Name}</b> {a.Description}
                            </li>
                        </ul>
                    ))}
                </>
            )}
        </div>
    );
}

type LairDialogProps = {
    visible: boolean;
    selectedOwningEntityDBID: number;
    lairs: Lair[];
    onClose: () => void;
    ReturnLair: (lair: Lair | undefined) => void;
};

enum Code {
    OK,
    Cancel,
}

export function LairDialog({ visible, selectedOwningEntityDBID, lairs, onClose, ReturnLair }: LairDialogProps) {
    const [selectedLair, setSelectedLair] = React.useState<Lair | undefined>(undefined);
    const [radio_value, setRadioValue] = React.useState<number>(selectedOwningEntityDBID);

    const return_lair = (code: Code) => {
        if (code === Code.OK) {
            if (selectedLair) {
                ReturnLair(selectedLair);
            } else ReturnLair(undefined);
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
            <button onClick={() => return_lair(Code.Cancel)}>X Cancel</button>
            <button onClick={() => return_lair(Code.OK)}>
                <GiCheckMark /> OK
            </button>
        </div>
    );

    if (!visible || lairs.length === 0) return null;

    return (
        <Dialog header="Choose Lair" visible={visible} style={{ width: "50vw" }} onHide={CloseDialog} className="lairDialog" footer={footer_content}>
            <input
                type={"radio"}
                id={"lair_dialog_none"}
                name={"none"}
                value={"none"}
                checked={radio_value === -1}
                onChange={() => {
                    setRadioValue(-1), setSelectedLair(undefined);
                }}
            />
            <label htmlFor={"lair_dialog_none"}>None</label>
            {lairs.map((l, ind) => (
                <section key={ind}>
                    <input
                        type={"radio"}
                        id={"lair_dialog" + l.Name}
                        name={l.Name}
                        value={l.OwningEntityDBID}
                        checked={l.OwningEntityDBID === radio_value}
                        onChange={() => {
                            setRadioValue(l.OwningEntityDBID), setSelectedLair(l);
                        }}
                    />
                    <label htmlFor={"lair_dialog" + l.Name}>{l.Name}</label>
                </section>
            ))}
        </Dialog>
    );
}
