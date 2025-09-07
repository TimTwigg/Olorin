import * as React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { GiCheckMark } from "react-icons/gi";

import { Player } from "@src/models/player";
import * as api from "@src/controllers/api";

type PlayerDialogProps = {
    visible: boolean;
    campaign: string;
    currentPlayersIDs: number[];
    onClose: () => void;
    callback: (ids: number[]) => void;
};

enum Code {
    OK,
    Cancel,
}

export function PlayerDialog({ visible, campaign, currentPlayersIDs, onClose, callback }: PlayerDialogProps) {
    const [selectedPlayerIDs, setSelectedPlayerIDs] = React.useState<number[]>(currentPlayersIDs);
    const [campaignPlayers, setCampaignPlayers] = React.useState<Player[]>([]);
    const playersRef = React.useRef<number>(0);

    const return_players = (code: Code) => {
        if (code === Code.OK) {
            if (selectedPlayerIDs) {
                callback(selectedPlayerIDs.filter((id) => !currentPlayersIDs.includes(id)));
            } else callback([]);
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
            <Button onClick={() => return_players(Code.Cancel)} severity="secondary">
                X Cancel
            </Button>
            <Button onClick={() => return_players(Code.OK)}>
                <GiCheckMark /> OK
            </Button>
        </div>
    );

    React.useEffect(() => {
        if (playersRef.current === 0) {
            playersRef.current = 1;
            api.getCampaign(campaign).then((res) => {
                let campaign = res.Campaign;
                if (campaign) {
                    setCampaignPlayers(campaign.Players);
                }
            });
        }
    }, []);

    if (!visible || campaign === "") return null;

    return (
        <Dialog header="Include Players" visible={visible} style={{ width: "50vw" }} onHide={CloseDialog} className="playerDialog" footer={footer_content}>
            {campaignPlayers.map((player, index) => {
                return (
                    <section key={`player_dialog_${index}`}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedPlayerIDs.includes(player.StatBlock.ID)}
                                onChange={() => {
                                    if (selectedPlayerIDs.includes(player.StatBlock.ID)) {
                                        setSelectedPlayerIDs(selectedPlayerIDs.filter((id) => id !== player.StatBlock.ID));
                                    } else {
                                        setSelectedPlayerIDs([...selectedPlayerIDs, player.StatBlock.ID]);
                                    }
                                }}
                                disabled={currentPlayersIDs.includes(player.StatBlock.ID)}
                            />
                            {player.StatBlock.Name}
                        </label>
                    </section>
                );
            })}
        </Dialog>
    );
}
