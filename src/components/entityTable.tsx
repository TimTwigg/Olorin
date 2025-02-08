import * as React from "react";
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
} from "@tanstack/react-table";

import { FaAddressCard } from "react-icons/fa";

import { EntityOverviewT } from "@src/models/entity";
import { DebouncedInput } from "@src/components/debouncedInput";
import "@src/styles/entityTable.scss";

// Modified from Tanstack example:
// https://tanstack.com/table/latest/docs/framework/react/examples/filters

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range" | "select"
    }
}

type EntityTableProps = {
    creatures: EntityOverviewT[],
    displayCallback: (name: string) => void,
    addCallback: (name: string) => void,
}

export const EntityTable = ({ creatures, displayCallback, addCallback }: EntityTableProps) => {
    const [data, _] = React.useState<EntityOverviewT[]>(creatures);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const factory = createColumnHelper<EntityOverviewT>();

    const columns = React.useMemo<ColumnDef<EntityOverviewT, any>[]>(
        () => [
            factory.accessor("Name", {
                cell: info => info.getValue(),
                header: () => "Name",
                meta: { filterVariant: "text" },
            }),
            factory.accessor("Type", {
                cell: info => info.getValue(),
                header: () => "Type",
                meta: { filterVariant: "select" },
            }),
            factory.accessor("Size", {
                cell: info => info.getValue(),
                header: () => "Size",
                meta: { filterVariant: "select" },
            }),
            factory.accessor("DifficultyRating", {
                cell: info => info.getValue(),
                header: () => "CR",
                meta: { filterVariant: "range" },
            }),
            factory.accessor("Name", {
                cell: props => <button className="iconButton" onClick={() => displayCallback(props.row.original.Name)}><FaAddressCard /></button>,
                header: () => "Display",
                id: "display",
                enableSorting: false,
            }),
            factory.accessor("Name", {
                cell: props => <button className="iconButton" onClick={() => { addCallback(props.row.original.Name) }}>+</button>,
                header: "Add",
                id: "add",
                enableSorting: false,
            }),
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
    });

    return (
        <div className="entityTable">
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => {
                        return (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? "cursor-pointer select-none"
                                                            : "",
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
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
                        )
                    })}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={row.id + cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div id="tableMeta">
                <section>
                    <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>{"<<"}</button>
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{"<"}</button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{">"}</button>
                    <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>{">>"}</button>
                </section>
                <section>
                    Page
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </strong>
                </section>
                |
                <span className="flex">
                    Go to page:
                    <input type="number" min="1" max={table.getPageCount()} defaultValue={table.getState().pagination.pageIndex + 1} onChange={e => { table.setPageIndex(e.target.value ? Number(e.target.value) - 1 : 0) }} />
                </span>
                <select value={table.getState().pagination.pageSize} onChange={e => { table.setPageSize(Number(e.target.value)) }}>
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function Filter({ column }: { column: Column<any, unknown> }) {
    const columnFilterValue = column.getFilterValue()
    const { filterVariant } = column.columnDef.meta ?? {}

    const sortedUniqueValues = React.useMemo(
        () =>
            filterVariant === "select"
                ? Array.from(column.getFacetedUniqueValues().keys())
                    .sort()
                    .slice(0, 5000)
                : [],
        [column.getFacetedUniqueValues(), filterVariant]
    )

    return filterVariant === "range" ? (
        <div>
            <div className="flex">
                <DebouncedInput
                    type="number"
                    min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                    max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                    value={(columnFilterValue as [number, number])?.[0] ?? ""}
                    onChange={value =>
                        column.setFilterValue((old: [number, number]) => [value, old?.[1]])
                    }
                    placeholder={`Min`}
                />
                <span className="smalltext">-</span>
                <DebouncedInput
                    type="number"
                    min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
                    max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
                    value={(columnFilterValue as [number, number])?.[1] ?? ""}
                    onChange={value =>
                        column.setFilterValue((old: [number, number]) => [old?.[0], value])
                    }
                    placeholder={`Max`}
                />
            </div>
        </div>
    ) : filterVariant === "select" ? (
        <select
            onChange={e => column.setFilterValue(e.target.value)}
            value={columnFilterValue?.toString()}
        >
            <option value="">All</option>
            {sortedUniqueValues.map(value => (
                <option value={value} key={value}>
                    {value}
                </option>
            ))}
        </select>
    ) : filterVariant === undefined ? (
        <div className="space" />
    ) : (
        <DebouncedInput
            type="text"
            onChange={value => column.setFilterValue(value)}
            placeholder={`Search...`}
            value={(columnFilterValue ?? "") as string}
        />
    )
}