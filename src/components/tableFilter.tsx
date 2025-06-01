import {
    Column,
    RowData,
} from "@tanstack/react-table";
import * as React from "react";
import { DebouncedInput } from "@src/components/debouncedInput";

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range" | "select" | "date" | undefined
    }
}

export function Filter({ column }: { column: Column<any, unknown> }) {
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
    ) : filterVariant === "text" ? (
        <DebouncedInput
            type="text"
            onChange={value => column.setFilterValue(value)}
            placeholder={`Search...`}
            value={(columnFilterValue ?? "") as string}
        />
    ) : filterVariant === "date" ? (
        <DebouncedInput
            type="date"
            onChange={value => column.setFilterValue(value)}
            placeholder={`Select date`}
            value={(columnFilterValue ?? "") as string}
        />
    ) : (
        <div className="space" />
    )
}