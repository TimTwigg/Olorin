import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
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
import { Filter } from "@src/components/tableFilter";
import "@src/styles/tables.scss";

// Modified from Tanstack example:
// https://tanstack.com/table/latest/docs/framework/react/examples/filters

type EntityTableProps = {
    creatures: EntityOverviewT[],
    displayCallback: (id: number) => void,
    addCallback: (id: number) => void,
}

export const EntityTable = ({ creatures, displayCallback, addCallback }: EntityTableProps) => {
    const [data, setData] = React.useState<EntityOverviewT[]>(creatures);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const dataRef = React.useRef(0);

    const factory = createColumnHelper<EntityOverviewT>();

    const columns: ColumnDef<EntityOverviewT, any>[] = React.useMemo<ColumnDef<EntityOverviewT, any>[]>(
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
            factory.accessor("ChallengeRating", {
                cell: info => info.getValue(),
                header: () => "CR",
                meta: { filterVariant: "range" },
            }),
            factory.accessor("Source", {
                cell: info => info.getValue(),
                header: () => "Source",
                meta: { filterVariant: "select" },
            }),
            factory.display({
                id: "display",
                cell: props => <button className="iconButton" onClick={() => displayCallback(props.row.original.ID)}><FaAddressCard /></button>,
            }),
            factory.display({
                id: "add",
                cell: props => <button className="iconButton" onClick={() => { addCallback(props.row.original.ID) }}>+</button>,
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

    React.useEffect(() => {
        if (dataRef.current === 0 && creatures.length > 0) {
            setData(creatures);
            dataRef.current = 1;
        }
    }, [creatures]);

    return (
        <div className="table">
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
            <div className="tableMeta">
                <section>
                    {table.getRowCount()} row{table.getRowCount() === 1 ? "" : "s"} loaded
                </section>
                |
                <section>
                    <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>{"<<"}</button>
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{"<"}</button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{">"}</button>
                    <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>{">>"}</button>
                </section>
                |
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