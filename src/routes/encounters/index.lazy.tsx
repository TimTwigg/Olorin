import * as React from "react";
import { createLazyFileRoute, useRouteContext, useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { ConfirmDialog, DialogOptions } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconField";
import { InputIcon } from "primereact/inputicon";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Menu } from "primereact/menu";
import { FilterMatchMode, FilterOperator, PrimeIcons } from "primereact/api";
import { IoWarningSharp } from "react-icons/io5";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";

import * as api from "@src/controllers/api";
import { Encounter, EncounterOverview } from "@src/models/encounter";
import { newLocalDate } from "@src/controllers/utils";
import { displayDate } from "@src/controllers/utils";
import { CampaignOverview } from "@src/models/campaign";
import { Skeleton } from "primereact/skeleton";

export const Route = createLazyFileRoute("/encounters/")({
    component: Encounters,
});

function Encounters() {
    const context = useRouteContext({ from: "__root__" });
    const navigate = useNavigate({ from: "/encounters" });

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
    const [LocalCampaignState, SetLocalCampaignState] = React.useState<CampaignOverview | null>(null);

    const [filters, setFilters] = React.useState<DataTableFilterMeta>();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [globalFilterValue, setGlobalFilterValue] = React.useState<string>("");
    const [tableKey, setTableKey] = React.useState<number>(0); // Used to force table re-render

    const createNewEncounter = () => {
        SetLocalStringState1("");
        SetLocalStringState2("");
        SetLocalCampaignState(null);
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

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const _filters = { ...filters };

        if (_filters["global"] && "value" in _filters["global"]) {
            (_filters["global"] as { value: string }).value = value;
        }

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            Name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            Description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            "Metadata.Campaign": { value: null, matchMode: FilterMatchMode.IN },
            "Metadata.CreationDate": { value: null, matchMode: FilterMatchMode.DATE_IS },
            "Metadata.AccessedDate": { value: null, matchMode: FilterMatchMode.DATE_IS },
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

    const stringItemTemplate = (option: string) => {
        return (
            <div>
                <span>{option}</span>
            </div>
        );
    };

    const campaignFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <MultiSelect value={options.value} options={context.campaigns.map((c) => c.Name)} itemTemplate={stringItemTemplate} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Any" className="p-column-filter" maxSelectedLabels={2} style={{ minWidth: "14rem" }} />;
    };

    const dateFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
    };

    const campaignBodyTemplate = (rowData: EncounterOverview) => {
        if (!context.loaded) return <Skeleton width="10rem" />;
        const campaign = context.campaigns.find((c: CampaignOverview) => c.id === rowData.Metadata.CampaignID);
        return <span>{campaign ? campaign.Name : rowData.Metadata.CampaignID}</span>;
    };

    const optionsBodyTemplate = (rowData: EncounterOverview) => {
        const menuRef = React.createRef<Menu>();

        const items = [
            {
                label: "Delete Encounter",
                icon: "pi pi-fw pi-trash",
                command: () => {
                    deleteEncounter(rowData);
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

    const finishLoadingAfterContext = React.useCallback(function finishLoading(callback: () => void) {
        if (context.loaded) {
            callback();
            return;
        }
        setTimeout(() => finishLoading(callback), 500);
    }, [context.loaded]);

    const header = renderHeader();

    React.useEffect(() => {
        if (getEncountersRef.current === 0) {
            getEncountersRef.current = 1;
            api.getEncounters().then((res) => {
                SetEncounters(res.Encounters);
            });
            initFilters();
            finishLoadingAfterContext(() => {
                setLoading(false);
                setTableKey((prev) => prev + 1); // Force table re-render after context is loaded
            });
        }
    }, [getEncountersRef, finishLoadingAfterContext]);

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
            <DataTable
                key={tableKey}
                value={encounters}
                stripedRows
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                removableSort
                filters={filters}
                filterDisplay="menu"
                loading={loading}
                globalFilterFields={["Name", "Description", "Campaign"]}
                header={header}
                emptyMessage="No encounters found."
                className="ten columns offset-by-one column"
                style={{ fontSize: "1.5rem" }}
                onRowClick={(e) => navigate({ to: `/encounters/${(e.data as EncounterOverview).id}` })}
                rowClassName={(_) => "data-table-clickable-row"}
            >
                <Column field="Name" header="Name" filter sortable />
                <Column field="Description" header="Description" filter sortable />
                <Column field="Metadata.Campaign" header="Campaign" filter filterElement={campaignFilterTemplate} body={campaignBodyTemplate} showFilterMatchModes={false} sortable />
                <Column field="Metadata.CreationDate" header="Creation Date" dataType="date" body={(rowData) => displayDate(rowData.Metadata.CreationDate)} filter filterElement={dateFilterTemplate} sortable />
                <Column field="Metadata.AccessedDate" header="Last Accessed" dataType="date" body={(rowData) => displayDate(rowData.Metadata.AccessedDate)} filter filterElement={dateFilterTemplate} sortable />
                <Column body={optionsBodyTemplate} header="Options" />
            </DataTable>
            <ConfirmDialog
                visible={dialogOptions.visible}
                onHide={() => {
                    SetDialogOptions({ ...dialogOptions, visible: false });
                    dialogOptions.onHide();
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
                        <Button label="Cancel" onClick={() => SetOpenCreationDialog(false)} severity="secondary" />
                        <Button
                            label="Done"
                            onClick={() => {
                                if (LocalStringState1 == "" || LocalStringState2 == "" || LocalCampaignState == null) {
                                    toast.error("All fields are required.");
                                    return;
                                }
                                api.saveEncounter(new Encounter(0, LocalStringState1, LocalStringState2, LocalCampaignState.id, { AccessedDate: newLocalDate(), CreationDate: newLocalDate() }))
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
                <div className="inputContainer">
                    <label htmlFor="encounter-name">Name</label>
                    <input id="encounter-name" type="text" value={LocalStringState1} onChange={(e) => SetLocalStringState1(e.target.value)} placeholder="Encounter Name" />
                    <br />
                    <label htmlFor="encounter-description">Description</label>
                    <input id="encounter-description" type="text" value={LocalStringState2} onChange={(e) => SetLocalStringState2(e.target.value)} placeholder="Encounter Description" />
                    <br />
                    <label htmlFor="encounter-campaign">Campaign</label>
                    <select id="encounter-campaign" value={LocalCampaignState?.id || 0} onChange={(e) => SetLocalCampaignState(context.campaigns.find((campaign) => campaign.id === parseInt(e.target.value)) || null)}>
                        <option value="0" defaultChecked disabled>
                            Select Campaign
                        </option>
                        {context.campaigns.map((campaign) => (
                            <option key={campaign.id} value={campaign.id}>
                                {campaign.Name}
                            </option>
                        ))}
                    </select>
                </div>
            </Dialog>
        </SessionAuth>
    );
}
