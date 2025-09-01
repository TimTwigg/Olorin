import * as React from "react";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { IoWarningSharp } from "react-icons/io5";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

import * as api from "@src/controllers/api";
import { Encounter, EncounterOverview } from "@src/models/encounter";
import { newLocalDate } from "@src/controllers/utils";
import { EncountersTable } from "@src/components/encountersTable";

export const Route = createLazyFileRoute("/encounters/")({
    component: Encounters,
});

function Encounters() {
    const context = useRouteContext({ from: "__root__" });

    const [encounters, SetEncounters] = React.useState<EncounterOverview[]>([]);
    const getEncountersRef = React.useRef(0);
    const [dialogOptions, SetDialogOptions] = React.useState<DialogOptions>({
        visible: false,
        label: "",
        message: "",
        onHide: () => {},
        accept: () => {},
        reject: () => {},
    });
    const [openCreationDialog, SetOpenCreationDialog] = React.useState<boolean>(false);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");

    const createNewEncounter = () => {
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetLocalStringState3("");
        SetOpenCreationDialog(true);
    };

    const deleteEncounter = (encounter: EncounterOverview) => {
        SetDialogOptions({
            visible: true,
            label: "Delete Encounter",
            message: `Are you sure you want to delete the encounter "${encounter.Name}"?`,
            onHide: () => {
                SetDialogOptions({ ...dialogOptions, visible: false });
            },
            accept: () => {
                api.deleteEncounter(encounter.id).then((res: boolean) => {
                    if (res) {
                        window.location.reload();
                        toast.success("Encounter deleted successfully.");
                    } else {
                        toast.error("Failed to delete Encounter.");
                    }
                });
            },
            reject: () => {},
            defaultFocus: "reject",
            icon: <IoWarningSharp />,
        });
    };

    React.useEffect(() => {
        if (getEncountersRef.current === 0) {
            getEncountersRef.current = 1;
            api.getEncounters().then((res) => {
                SetEncounters(res.Encounters);
            });
        }
    }, [getEncountersRef]);

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <h1>Encounters</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Encounters</h3>
                <button className="two columns" onClick={createNewEncounter}>
                    Create New Encounter
                </button>
            </div>
            <div className="break" />
            <EncountersTable encounters={encounters} className="ten columns offset-by-one column" deleteCallback={deleteEncounter} />
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
            <Dialog
                visible={openCreationDialog}
                onHide={() => SetOpenCreationDialog(false)}
                header={"Create New Encounter"}
                className="dialog"
                focusOnShow={true}
                modal={true}
                maskClassName="dialog-mask"
                footer={
                    <div>
                        <Button label="Cancel" onClick={() => SetOpenCreationDialog(false)} />
                        <Button
                            label="Done"
                            onClick={() => {
                                if (LocalStringState1 == "" || LocalStringState2 == "" || LocalStringState3 == "") {
                                    toast.error("All fields are required.");
                                    return;
                                }
                                api.saveEncounter(new Encounter(0, LocalStringState1, LocalStringState2, LocalStringState3, { AccessedDate: newLocalDate(), CreationDate: newLocalDate() }))
                                    .then((res) => {
                                        if (res) {
                                            window.location.replace(`/encounters/${res.id}`);
                                            toast.success("Encounter created successfully.");
                                        } else {
                                            toast.error("Failed to create encounter.");
                                        }
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                        toast.error("Failed to create encounter. Please try again later.");
                                    });
                                SetOpenCreationDialog(false);
                            }}
                            autoFocus
                        />
                    </div>
                }
            >
                <div>
                    <label htmlFor="encounter-name">Name</label>
                    <input id="encounter-name" type="text" value={LocalStringState1} onChange={(e) => SetLocalStringState1(e.target.value)} placeholder="Encounter Name" />
                    <br />
                    <label htmlFor="encounter-description">Description</label>
                    <input id="encounter-description" type="text" value={LocalStringState2} onChange={(e) => SetLocalStringState2(e.target.value)} placeholder="Encounter Description" />
                    <br />
                    <label htmlFor="encounter-campaign">Campaign</label>
                    <select id="encounter-campaign" value={LocalStringState3} onChange={(e) => SetLocalStringState3(e.target.value)}>
                        <option value="" defaultChecked disabled>
                            Select Campaign
                        </option>
                        {context.campaigns.map((campaign) => (
                            <option key={campaign.Name} value={campaign.Name}>
                                {campaign.Name}
                            </option>
                        ))}
                    </select>
                </div>
            </Dialog>
        </SessionAuth>
    );
}
