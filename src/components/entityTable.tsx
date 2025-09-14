import * as React from "react";
import { useRouteContext } from "@tanstack/react-router";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconField";
import { InputIcon } from "primereact/inputicon";
import { MultiSelect } from "primereact/multiselect";
import { FilterMatchMode, FilterOperator } from "primereact/api";

import { EntityOverviewT } from "@src/models/entity";
import "@src/styles/tables.scss";

type EntityTableProps = {
    creatures: EntityOverviewT[];
    displayCallback: (id: number) => void;
    addCallback: (id: number) => void;
};

export const EntityTable = ({ creatures, displayCallback, addCallback }: EntityTableProps) => {
    const context = useRouteContext({ from: "__root__" });

    const [data, setData] = React.useState<EntityOverviewT[]>(creatures);
    const [filters, setFilters] = React.useState<DataTableFilterMeta>();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [globalFilterValue, setGlobalFilterValue] = React.useState<string>("");
    const [creatureTypes, setCreatureTypes] = React.useState<string[]>([]);
    const [creatureSizes, setCreatureSizes] = React.useState<string[]>([]);
    const dataRef = React.useRef(0);

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

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
            Type: { value: null, matchMode: FilterMatchMode.IN },
            Size: { value: null, matchMode: FilterMatchMode.IN },
            // "country.name": { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            // representative: { value: null, matchMode: FilterMatchMode.IN },
            // date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            // balance: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            // status: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            // activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
            // verified: { value: null, matchMode: FilterMatchMode.EQUALS },
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

    const stringItemTemplate = (option: any) => {
        return (
            <div>
                <span>{option}</span>
            </div>
        );
    };

    const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <MultiSelect value={options.value} options={creatureTypes} itemTemplate={stringItemTemplate} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Any" className="p-column-filter" maxSelectedLabels={2} style={{ minWidth: "14rem" }} />;
    };

    const sizeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return <MultiSelect value={options.value} options={creatureSizes} itemTemplate={stringItemTemplate} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Any" className="p-column-filter" maxSelectedLabels={2} style={{ minWidth: "14rem" }} />;
    };

    React.useEffect(() => {
        if (dataRef.current === 0 && creatures.length > 0) {
            setData(creatures);
            dataRef.current = 1;
            initFilters();
            setCreatureTypes(context.creatureTypes);
            setCreatureSizes(context.creatureSizes);
            setLoading(false);
        }
    }, [creatures]);

    const header = renderHeader();

    return (
        <>
            <p>
                {}
            </p>
            <DataTable value={data} stripedRows paginator rows={25} rowsPerPageOptions={[10, 25, 50]} removableSort filters={filters} filterDisplay="menu" loading={loading} globalFilterFields={["Name", "Type", "Source"]} header={header}>
                <Column field="Name" header="Name" filter style={{ minWidth: "8rem" }} />
                <Column field="Type" header="Type" filter filterElement={typeFilterTemplate} showFilterMatchModes={false} />
                <Column field="Size" header="Size" filter filterElement={sizeFilterTemplate} showFilterMatchModes={false} />
                <Column field="ChallengeRating" header="CR" filter />
                <Column field="Source" header="Source" filter />
                <Column body={(rowData) => <Button icon="pi pi-id-card" outlined className="iconButton" onClick={() => displayCallback(rowData.ID)} />} header="Display" />
                <Column body={(rowData) => <Button icon="pi pi-plus" outlined className="iconButton" onClick={() => addCallback(rowData.ID)} />} header="Add" />
            </DataTable>
        </>
    );
};
