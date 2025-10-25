import * as React from "react";
import { createLazyFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import { toast } from "react-toastify";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconField";
import { InputIcon } from "primereact/inputicon";
import { Calendar } from "primereact/calendar";
import { Menu } from "primereact/menu";
import { FilterMatchMode, FilterOperator, PrimeIcons } from "primereact/api";

import { Campaign, CampaignOverview } from "@src/models/campaign";
import { displayDate } from "@src/controllers/utils";
import * as api from "@src/controllers/api";

export const Route = createLazyFileRoute("/campaigns/")({
    component: Campaigns,
});

function Campaigns() {
    const context = useRouteContext({ from: "__root__" });
    const navigate = useNavigate({ from: "/campaigns" });

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
    const [campaigns, SetCampaigns] = React.useState<CampaignOverview[]>(context.campaigns ?? []);

    const [filters, setFilters] = React.useState<DataTableFilterMeta>();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [globalFilterValue, setGlobalFilterValue] = React.useState<string>("");

    const deleteCampaign = (campaignID: number, campaignName: string) => {
        SetConfirmDialogOptions({
            visible: true,
            label: "Delete Campaign",
            message: `Are you sure you want to delete the campaign: "${campaignName}"?`,
            onHide: () => {
                SetConfirmDialogOptions({
                    ...confirmDialogOptions,
                    visible: false,
                });
            },
            accept: () => {
                api.deleteCampaign(campaignID).then((res: boolean) => {
                    if (res) {
                        window.location.reload();
                        toast.success("Campaign deleted successfully.");
                    } else {
                        toast.error("Failed to delete Campaign.");
                    }
                });
            },
            reject: () => {},
            defaultFocus: "reject",
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
        });
    };

    const createNewCampaign = () => {
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetOpenCreationDialog(true);
    };

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const _filters = { ...filters };

        if (_filters["global"] && "value" in _filters["global"]) {
            (_filters["global"] as { value: any }).value = value;
        }

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            CreationDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
            LastModified: { value: null, matchMode: FilterMatchMode.DATE_IS },
        });
        setGlobalFilterValue("");
    };

    const renderHeader = () => {
        return (
            <div className="justify-between">
                <Button icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
        );
    };

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
    };

    const optionsBodyTemplate = (rowData: CampaignOverview) => {
        const menuRef = React.createRef<Menu>();

        const items = [
            {
                label: "Delete Campaign",
                icon: "pi pi-fw pi-trash",
                command: () => {
                    deleteCampaign(rowData.id, rowData.Name);
                },
            },
        ];

        return (
            <div>
                <Menu model={items} ref={menuRef} popup />
                <Button icon={PrimeIcons.BARS} outlined severity="info" onClick={(e) => menuRef.current?.toggle(e)} />
            </div>
        );
    };

    const header = renderHeader();

    React.useEffect(() => {
        initFilters();
        api.getCampaigns(1).then((data) => {
            SetCampaigns(data.Campaigns);
        });
        setLoading(false);
    }, []);

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
            <DataTable
                value={campaigns}
                stripedRows
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                removableSort
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                globalFilterFields={["Name", "Description"]}
                header={header}
                emptyMessage="No campaigns found."
                className="ten columns offset-by-one column"
                style={{ fontSize: "1.5rem" }}
                onRowClick={(e) => navigate({ to: `/campaigns/${(e.data as CampaignOverview).id}` })}
                rowClassName={(_) => "data-table-clickable-row"}
            >
                <Column field="Name" header="Name" filter sortable />
                <Column field="Description" header="Description" filter sortable />
                <Column field="CreationDate" header="Creation Date" dataType="date" body={(rowData) => displayDate(rowData.CreationDate)} filter filterElement={dateFilterTemplate} sortable />
                <Column field="LastModified" header="Last Modified Date" dataType="date" body={(rowData) => displayDate(rowData.LastModified)} filter filterElement={dateFilterTemplate} sortable />
                <Column header="Options" body={optionsBodyTemplate} />
            </DataTable>
            <ConfirmDialog
                visible={confirmDialogOptions.visible}
                onHide={() => {
                    SetConfirmDialogOptions({
                        ...confirmDialogOptions,
                        visible: false,
                    });
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
                                api.createCampaign(new Campaign(0, LocalStringState1, LocalStringState2))
                                    .then((res) => {
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
