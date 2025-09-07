import * as React from "react";
import { ColumnDef, ColumnFiltersState, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, getFacetedUniqueValues, getFacetedMinMaxValues } from "@tanstack/react-table";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "@tanstack/react-router";

import { GiTrashCan, GiHamburgerMenu } from "react-icons/gi";

import { displayDate } from "@src/controllers/utils";
import { Filter } from "@src/components/tableFilter";
import { EncounterOverview } from "@src/models/encounter";
import "@src/styles/tables.scss";

type EncountersTableProps = {
    encounters: EncounterOverview[];
    className?: string;
    deleteCallback: (encounter: EncounterOverview) => void;
};

export const EncountersTable = ({ encounters, className, deleteCallback }: EncountersTableProps) => {
    const [data, setData] = React.useState<EncounterOverview[]>(encounters);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const dataRef = React.useRef(0);

    const factory = createColumnHelper<EncounterOverview>();

    const columns: ColumnDef<EncounterOverview, any>[] = React.useMemo<ColumnDef<EncounterOverview, any>[]>(
        () => [
            factory.accessor("Name", {
                cell: (info) => (
                    <Link to="/encounters/$encounterID" params={{ encounterID: info.row.original.id.toString() }}>
                        {info.getValue().replace(/\s/g, "").length > 0 ? info.getValue() : "<encounter name>"}
                    </Link>
                ),
                header: () => "Name",
                meta: { filterVariant: "text" },
            }),
            factory.accessor("Description", {
                cell: (info) => info.getValue(),
                header: () => "Description",
                meta: { filterVariant: "text" },
            }),
            factory.accessor("Metadata.Campaign", {
                cell: (info) => info.getValue(),
                header: () => "Campaign",
                meta: { filterVariant: "select" },
            }),
            factory.accessor("Metadata.CreationDate", {
                cell: (info) => displayDate(info.getValue()),
                header: () => "Creation Date",
            }),
            factory.accessor("Metadata.AccessedDate", {
                cell: (info) => displayDate(info.getValue()),
                header: () => "Last Accessed",
            }),
            factory.display({
                id: "actions",
                cell: (info) => (
                    <Menu>
                        <MenuButton className={"iconButton"}>
                            <GiHamburgerMenu />
                        </MenuButton>
                        <MenuItems anchor={{ to: "bottom", gap: 5, padding: 0 }} className={"menu-items"}>
                            <MenuItem>
                                <button onClick={() => deleteCallback(info.row.original)}>
                                    <GiTrashCan color="#861C06" />
                                    Delete
                                </button>
                            </MenuItem>
                        </MenuItems>
                    </Menu>
                ),
            }),
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
    });

    React.useEffect(() => {
        if (dataRef.current === 0 && encounters.length > 0) {
            dataRef.current = 1;
            setData(encounters);
        }
    }, [encounters]);

    return (
        <div className={"table large" + (className ? " " + className : "")}>
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => {
                        return (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                                {header.column.getCanFilter() ? (
                                                    <div>
                                                        <Filter column={header.column} />
                                                    </div>
                                                ) : null}
                                            </>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        );
                    })}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return <td key={row.id + cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="tableMeta">
                <section>
                    {table.getRowCount()} row{table.getRowCount() === 1 ? "" : "s"} loaded
                </section>
                |
                <section>
                    <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        {"<<"}
                    </button>
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        {"<"}
                    </button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        {">"}
                    </button>
                    <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        {">>"}
                    </button>
                </section>
                |
                <section>
                    Page
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>
                </section>
                |
                <span className="flex">
                    Go to page:
                    <input
                        type="number"
                        min="1"
                        max={table.getPageCount()}
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            table.setPageIndex(e.target.value ? Number(e.target.value) - 1 : 0);
                        }}
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
