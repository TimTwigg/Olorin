import * as React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { IoWarningSharp } from "react-icons/io5";
import { toast } from "react-toastify";

import { Campaign, CampaignOverview } from "@src/models/campaign";
import { CampaignsTable } from "@src/components/campaignsTable";
import * as api from "@src/controllers/api";

export const Route = createLazyFileRoute("/campaigns")({
    component: Campaigns,
})

function Campaigns() {
    const [campaigns, SetCampaigns] = React.useState<CampaignOverview[]>([]);
    const [activeCampaign, SetActiveCampaign] = React.useState<Campaign | null>(null);
    const [confirmDialogOptions, SetConfirmDialogOptions] = React.useState<DialogOptions>({ visible: false, label: "", message: "", onHide: () => { }, accept: () => { }, reject: () => { } });
    const [openCreationDialog, SetOpenCreationDialog] = React.useState<boolean>(false);
    const getCampaignsRef = React.useRef<number>(0);
    const [LocalStringState1, SetLocalStringState1] = React.useState<string>("");
    const [LocalStringState2, SetLocalStringState2] = React.useState<string>("");

    const getCampaign = (name: string) => {
        api.getCampaign(name).then((res) => {
            if (!res.Campaign) return;
            SetActiveCampaign(res.Campaign);
        });
    };

    const selectCampaign = (campaignName: string) => {
        getCampaign(campaignName);
    };

    const deleteCampaign = (campaignName: string) => {
        SetConfirmDialogOptions({
            visible: true,
            label: "Delete Campaign",
            message: `Are you sure you want to delete the campaign "${campaignName}"?`,
            onHide: () => { SetConfirmDialogOptions({ ...confirmDialogOptions, visible: false }) },
            accept: () => {
                api.deleteCampaign(campaignName).then((res: boolean) => {
                    if (res) {
                        window.location.reload();
                        toast.success("Encounter deleted successfully.");
                    }
                    else {
                        toast.error("Failed to delete Encounter.");
                    }
                })
            },
            reject: () => { },
            defaultFocus: "reject",
            icon: <IoWarningSharp />,
        });
    };

    const createNewCampaign = () => {
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetOpenCreationDialog(true);
    }

    const resetAllStates = () => {
        SetActiveCampaign(null);
        api.getCampaigns().then((res) => { SetCampaigns(res.Campaigns) });
    }

    React.useEffect(() => {
        if (getCampaignsRef.current === 0) {
            getCampaignsRef.current = 1;
            api.getCampaigns().then((res) => { SetCampaigns(res.Campaigns); });
        }
    }, [getCampaignsRef]);


    // Campaign overview screen
    if (!activeCampaign) {
        return (
            <SessionAuth
                onSessionExpired={async () => {
                    await Session.signOut()
                    window.location.href = "/auth"
                }}
            >
                <h1>Campaigns</h1>
                <div className="twelve columns">
                    <h3 className="eight columns offset-by-one column">My Campaigns</h3>
                    <button className="two columns" onClick={createNewCampaign}>Create New Campaign</button>
                </div>
                <div className="break" />
                <CampaignsTable className="ten columns offset-by-one columns" campaigns={campaigns} nameCallback={selectCampaign} deleteCallback={deleteCampaign} />
                <ConfirmDialog
                    visible={confirmDialogOptions.visible}
                    onHide={() => { SetConfirmDialogOptions({ ...confirmDialogOptions, visible: false }), confirmDialogOptions.onHide() }}
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
                    footer={<div>
                        <Button label="Cancel" onClick={() => SetOpenCreationDialog(false)} />
                        <Button label="Done" onClick={() => {
                            api.createCampaign(new Campaign(LocalStringState1, LocalStringState2)).then((res) => {
                                console.log(res);
                                if (res) {
                                    window.location.reload();
                                    toast.success("Campaign created successfully.");
                                }
                                else {
                                    toast.error("Failed to create campaign.");
                                }
                            }).catch((err) => {
                                console.error(err);
                                toast.error("Failed to create campaign. Please try again later.");
                            });
                            SetOpenCreationDialog(false);
                        }} autoFocus />
                    </div>}
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

    // Campaign details screen
    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut()
                window.location.href = "/auth"
            }}
        >
            <div className="playScreen container">
                <section className="justify-between">
                    <span className="three columns"><button className="big button" onClick={() => { resetAllStates() }} disabled={false}>Back to Campaigns</button></span>
                    <h3 className="six columns">{activeCampaign.Name}</h3>
                    <section className="three columns">
                        <span><strong>Created On:</strong> {activeCampaign.CreationDate?.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) || ""}</span>
                    </section>
                </section>
                <hr />
                <p>{activeCampaign.Description}</p>
                <hr />
                <section className="ten columns offset-by-one column flex">
                    {activeCampaign.Players.map((player, index) => {return <div key={index}>
                        <Card title={player.StatBlock.Name} subTitle={player.StatBlock.Description.Type}>
                            <p>
                                {player.Notes}
                            </p>
                        </Card>
                    </div>})}
                </section>
                <div className = "break" />
            </div>
            <ConfirmDialog
                visible={confirmDialogOptions.visible}
                onHide={() => { SetConfirmDialogOptions({ ...confirmDialogOptions, visible: false }), confirmDialogOptions.onHide() }}
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
        </SessionAuth>
    );
}
