import { Campaign, CampaignOverview } from "@src/models/campaign";

export type CampaignResponse = {
    Campaigns: CampaignOverview[];
}

export type SingleCampaignResponse = {
    Campaign: Campaign | undefined;
}