import * as React from "react";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { IoWarningSharp } from "react-icons/io5";
import { toast } from "react-toastify";

import { Campaign } from "@src/models/campaign";
import { CampaignsTable } from "@src/components/campaignsTable";
import * as api from "@src/controllers/api";

export const Route = createLazyFileRoute("/campaigns/")({
    component: Campaigns,
});

function Campaigns() {
    const context = useRouteContext({ from: "__root__" });

    const [confirmDialogOptions, SetConfirmDialogOptions] = React.useState<DialogOptions>({
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

    const deleteCampaign = (campaignName: string) => {
        SetConfirmDialogOptions({
            visible: true,
            label: "Delete Campaign",
            message: `Are you sure you want to delete the campaign "${campaignName}"?`,
            onHide: () => {
                SetConfirmDialogOptions({
                    ...confirmDialogOptions,
                    visible: false,
                });
            },
            accept: () => {
                api.deleteCampaign(campaignName).then((res: boolean) => {
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

    const createNewCampaign = () => {
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetOpenCreationDialog(true);
    };

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <h1>Campaigns</h1>
            <div className="twelve columns">
                <h3 className="eight columns offset-by-one column">My Campaigns</h3>
                <button className="two columns" onClick={createNewCampaign}>
                    Create New Campaign
                </button>
            </div>
            <div className="break" />
            <CampaignsTable className="ten columns offset-by-one columns" campaigns={context.campaigns} deleteCallback={deleteCampaign} />
            <ConfirmDialog
                visible={confirmDialogOptions.visible}
                onHide={() => {
                    SetConfirmDialogOptions({
                        ...confirmDialogOptions,
                        visible: false,
                    }),
                        confirmDialogOptions.onHide();
                }}
                header={confirmDialogOptions.label}
                message={confirmDialogOptions.message}
                className="dialog"
                focusOnShow={true}
                accept={confirmDialogOptions.accept}
                reject={confirmDialogOptions.reject}
                defaultFocus={confirmDialogOptions.defaultFocus}
                icon={confirmDialogOptions.icon}
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
                header={"Create New Campaign"}
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
                                api.createCampaign(new Campaign(LocalStringState1, LocalStringState2))
                                    .then((res) => {
                                        console.log(res);
                                        if (res) {
                                            window.location.reload();
                                            toast.success("Campaign created successfully.");
                                        } else {
                                            toast.error("Failed to create campaign.");
                                        }
                                    })
                                    .catch((err) => {
                                        console.error(err);
                                        toast.error("Failed to create campaign. Please try again later.");
                                    });
                                SetOpenCreationDialog(false);
                            }}
                            autoFocus
                        />
                    </div>
                }
            >
                <div>
                    <label htmlFor="campaign-name">Name</label>
                    <input id="campaign-name" type="text" value={LocalStringState1} onChange={(e) => SetLocalStringState1(e.target.value)} placeholder="Campaign Name" />
                    <br />
                    <label htmlFor="campaign-description">Description</label>
                    <input id="campaign-description" type="text" value={LocalStringState2} onChange={(e) => SetLocalStringState2(e.target.value)} placeholder="Campaign Description" />
                    <br />
                </div>
            </Dialog>
        </SessionAuth>
    );
}
