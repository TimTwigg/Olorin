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
} from "@tanstack/react-table";
import { Filter } from "@src/components/tableFilter";

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import { GiTrashCan, GiHamburgerMenu } from "react-icons/gi";

import { CampaignOverview } from "@src/models/campaign";

type CampaignTableProps = {
    campaigns: CampaignOverview[],
    className?: string,
    nameCallback?: (campaignName: string) => void,
    deleteCallback: (campaignName: string) => void,
}

export const CampaignsTable = ({ campaigns, className, nameCallback, deleteCallback }: CampaignTableProps) => {
    const [data, setData] = React.useState<CampaignOverview[]>(campaigns);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const dataRef = React.useRef(0);

    const factory = createColumnHelper<CampaignOverview>();

    const columns: ColumnDef<CampaignOverview, any>[] = React.useMemo<ColumnDef<CampaignOverview, any>[]>(() => [
        factory.accessor("Name", {
            cell: info => nameCallback ? <a onClick={() => { nameCallback(info.getValue()) }}>{info.getValue().replace(/\s/g, "").length > 0 ? info.getValue() : "<campaign name>"}</a> : info.getValue(),
            header: () => "Name",
            meta: { filterVariant: "text" },
        }),
        factory.accessor("Description", {
            cell: info => info.getValue(),
            header: () => "Description",
            meta: { filterVariant: "text" },
        }),
        factory.display({
            id: "actions",
            cell: info => (
                <Menu>
                    <MenuButton className={"iconButton"}><GiHamburgerMenu /></MenuButton>
                    <MenuItems anchor={{ to: "bottom", gap: 5, padding: 0 }} className={"menu-items"}>
                        <MenuItem><button onClick={() => deleteCallback(info.row.original.Name)}><GiTrashCan color="#861C06" />Delete</button></MenuItem>
                    </MenuItems>
                </Menu>
            ),
        })
    ], []);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
    });

    React.useEffect(() => {
        if (dataRef.current === 0 && campaigns.length > 0) {
            dataRef.current = 1;
            setData(campaigns);
        }
    }, [campaigns]);

    return (
        <div className={"table large" + (className ? " " + className : "")}>
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