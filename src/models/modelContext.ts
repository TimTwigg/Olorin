import { UserOptions } from "@src/models/userOptions";
import { Condition } from "@src/models/condition";
import { CampaignOverview } from "@src/models/campaign";

export interface ModelContext {
    userOptions: UserOptions;
    conditions: Condition[];
    creatureTypes: string[];
    campaigns: CampaignOverview[];
}
