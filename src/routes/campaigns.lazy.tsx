import * as React from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
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
    const [dialogOptions, SetDialogOptions] = React.useState<DialogOptions>({ visible: false, label: "", message: "", onHide: () => { }, accept: () => { }, reject: () => { } });
    const getCampaignsRef = React.useRef<number>(0);

    const getCampaign = (name: string) => {
        api.getCampaign(name).then((res) => {
            if (!res.Campaign) return;
            SetActiveCampaign(res.Campaign);
        });
    }

    const selectCampaign = (campaignName: string) => {
        getCampaign(campaignName);
    };

    const deleteCampaign = (campaignName: string) => {
        SetDialogOptions({
            visible: true,
            label: "Delete Campaign",
            message: `Are you sure you want to delete the campaign "${campaignName}"?`,
            onHide: () => { SetDialogOptions({ ...dialogOptions, visible: false }) },
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

    React.useEffect(() => {
        if (getCampaignsRef.current === 0) {
            getCampaignsRef.current = 1;
            api.getCampaigns().then((res) => { SetCampaigns(res.Campaigns); });
        }
    }, [getCampaignsRef]);

    const PageTemplate = ({ children }: { children: React.ReactNode }) => {
        return (
            <SessionAuth
                onSessionExpired={async () => {
                    await Session.signOut()
                    window.location.href = "/auth"
                }}
            >
                {children}
                <ConfirmDialog
                    visible={dialogOptions.visible}
                    onHide={() => { SetDialogOptions({ ...dialogOptions, visible: false }), dialogOptions.onHide() }}
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
            </SessionAuth>
        );
    }

    // Campaign overview screen
    if (!activeCampaign) {
        return (
            <PageTemplate>
                <h1>Campaigns</h1>
                <CampaignsTable className="eight columns offset-by-two columns" campaigns={campaigns} nameCallback={selectCampaign} deleteCallback={deleteCampaign} />
            </PageTemplate>
        );
    }

    // Campaign details screen
    return (
        <PageTemplate>
            <p>{activeCampaign.Name}</p>
            {/* TODO */}
        </PageTemplate>
    );
}
