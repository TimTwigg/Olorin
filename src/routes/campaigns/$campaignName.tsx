import * as React from "react";
import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { ButtonGroup } from "primereact/buttongroup";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { AutoComplete } from "primereact/autocomplete";
import { IoWarningSharp } from "react-icons/io5";
import { toast } from "react-toastify";

import { Campaign } from "@src/models/campaign";
import { Player } from "@src/models/player";
import * as api from "@src/controllers/api";

export const Route = createFileRoute("/campaigns/$campaignName")({
    loader: async ({ params: { campaignName } }) => {
        const activeCampaign =
            (await api
                .getCampaign(campaignName)
                .then((res) => {
                    return res ? res.Campaign : null;
                })
                .catch(() => null)) || null;
        return { activeCampaign };
    },
    component: ActiveCampaign,
});

function ActiveCampaign() {
    const activeCampaign: Campaign | null = Route.useLoaderData().activeCampaign;
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
    const [LocalStringState3, SetLocalStringState3] = React.useState<string>("");
    const [LocalStringState4, SetLocalStringState4] = React.useState<string>("");
    const [LocalStringState5, SetLocalStringState5] = React.useState<string>("");
    const [LocalPlayerState, SetLocalPlayerState] = React.useState<Player | null>(null);
    const [LocalNumberState1, SetLocalNumberState1] = React.useState<number>(0);
    const [TypeSelectionOptions, SetTypeSelectionOptions] = React.useState<string[]>([]);

    const editPlayer = (player: Player) => {
        SetLocalPlayerState(player);
        SetLocalStringState1(player.StatBlock.Name);
        SetLocalStringState2(player.Notes);
        SetLocalStringState3(player.StatBlock.Description.Type);
        SetLocalStringState4(player.StatBlock.Description.Alignment);
        SetLocalStringState5(player.StatBlock.Description.Category);
        SetLocalNumberState1(player.StatBlock.ChallengeRating);
        SetOpenCreationDialog(true);
    };

    const deletePlayer = (player: Player) => {
        SetConfirmDialogOptions({
            visible: true,
            label: "Delete Player",
            message: `Are you sure you want to delete the player "${player.StatBlock.Name}"?`,
            onHide: () => {
                SetConfirmDialogOptions({
                    ...confirmDialogOptions,
                    visible: false,
                });
            },
            accept: () => {
                api.deletePlayer(player).then((res: boolean) => {
                    if (res) {
                        window.location.reload();
                        toast.success("Player deleted successfully.");
                    } else {
                        toast.error("Failed to delete Player.");
                    }
                });
            },
            reject: () => {},
            defaultFocus: "reject",
            icon: <IoWarningSharp />,
        });
    };

    if (!activeCampaign) return <div>Loading...</div>;

    return (
        <SessionAuth
            onSessionExpired={async () => {
                await Session.signOut();
                window.location.href = "/auth";
            }}
        >
            <div className="playScreen container">
                <section className="justify-between">
                    <span className="three columns">
                        <Link to="/campaigns">
                            <button className="big button" disabled={false}>
                                Back to Campaigns
                            </button>
                        </Link>
                    </span>
                    <h3 className="six columns">{activeCampaign.Name}</h3>
                    <section className="three columns">
                        <span>
                            <strong>Created On:</strong>{" "}
                            {activeCampaign.CreationDate?.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            }) || ""}
                        </span>
                    </section>
                </section>
                <hr />
                <p>{activeCampaign.Description}</p>
                <hr />
                <section id="campaignPlayerArea" className="flex">
                    {activeCampaign.Players.map((player, index) => {
                        let foot = (
                            <div className="right">
                                <ButtonGroup>
                                    <Button label="Edit" outlined onClick={() => editPlayer(player)} />
                                    <Button label="Delete" severity="danger" outlined onClick={() => deletePlayer(player)} />
                                </ButtonGroup>
                            </div>
                        );
                        let head = (
                            <div className="right">
                                <Tag value={player.StatBlock.Description.Category === "Player" ? "Player" : "NPC"} severity={player.StatBlock.Description.Category === "Player" ? "success" : "info"} rounded />
                            </div>
                        );
                        return (
                            <div key={index}>
                                <Card title={player.StatBlock.Name} subTitle={`Level ${player.StatBlock.ChallengeRating} ${player.StatBlock.Description.Type} | ${player.StatBlock.Description.Alignment}`} footer={foot} header={head}>
                                    <p>{player.Notes}</p>
                                </Card>
                            </div>
                        );
                    })}
                </section>
                <div className="break" />
            </div>
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
                header={"Player Dialog"}
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
                                if (LocalPlayerState) {
                                    let p = LocalPlayerState;
                                    p.StatBlock.Name = LocalStringState1;
                                    p.StatBlock.ChallengeRating = LocalNumberState1;
                                    p.StatBlock.Description.Type = LocalStringState3;
                                    p.StatBlock.Description.Alignment = LocalStringState4;
                                    p.StatBlock.Description.Category = LocalStringState5;
                                    p.Notes = LocalStringState2;
                                    api.editPlayer(p)
                                        .then((res) => {
                                            if (res) {
                                                toast.success("Player edited successfully.");
                                            } else {
                                                toast.error("Failed to edit player.");
                                            }
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                            toast.error("Failed to edit player. Please try again later.");
                                        });
                                    SetLocalPlayerState(null);
                                }
                                SetOpenCreationDialog(false);
                            }}
                            autoFocus
                        />
                    </div>
                }
            >
                <div className="inputContainer">
                    <label htmlFor="player-name">Name</label>
                    <input id="player-name" type="text" className="margin-bottom" value={LocalStringState1} onChange={(e) => SetLocalStringState1(e.target.value)} placeholder="Name" />
                    <br />
                    <label htmlFor="entity-type">Entity Type</label>
                    <select id="entity-type" className="margin-bottom" value={LocalStringState5} onChange={(e) => SetLocalStringState5(e.target.value)}>
                        <option key={"entity-npc"} value={"Custom"}>
                            NPC
                        </option>
                        <option key={"entity-player"} value={"Player"}>
                            Player
                        </option>
                    </select>
                    <br />
                    <label htmlFor="player-level">Level</label>
                    <input type="number" className="margin-bottom" value={LocalNumberState1} onChange={(e) => SetLocalNumberState1(parseInt(e.target.value))} placeholder="Level" />
                    <br />
                    <label htmlFor="player-type">Type</label>
                    <AutoComplete
                        id="player-type"
                        className="margin-bottom"
                        value={LocalStringState3}
                        suggestions={TypeSelectionOptions}
                        completeMethod={(e) => {
                            SetTypeSelectionOptions(context.creatureTypes.filter((c) => c.toLowerCase().startsWith(e.query.toLowerCase())));
                        }}
                        onChange={(e: any) => SetLocalStringState3(e.value)}
                        placeholder="Select Type"
                        invalid={LocalStringState3 === ""}
                        dropdown
                        forceSelection
                    />
                    <br />
                    <label htmlFor="player-alignment">Alignment</label>
                    <input id="player-alignment" className="margin-bottom" type="text" value={LocalStringState4} onChange={(e) => SetLocalStringState4(e.target.value)} placeholder="Alignment" />
                    <br />
                    <section className="flex">
                        <label htmlFor="player-notes">Notes</label>
                        <textarea id="player-notes" value={LocalStringState2} onChange={(e) => SetLocalStringState2(e.target.value)} placeholder="Notes" />
                    </section>
                </div>
            </Dialog>
        </SessionAuth>
    );
}
