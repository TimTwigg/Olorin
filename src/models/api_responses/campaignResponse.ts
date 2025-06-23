import { Campaign, CampaignOverview } from "@src/models/campaign";

export type CampaignResponse = {
    Campaigns: Campaign[] | CampaignOverview[];
}

export type SingleCampaignResponse = {
    Campaign: Campaign | undefined;
}