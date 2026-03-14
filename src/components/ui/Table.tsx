import React from 'react';
import { MdInbox } from 'react-icons/md';
import DataLoader from '../common/DataLoader';

export interface ColumnDef<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T | string; // Like AG Grid's `field` — direct property access
    valueGetter?: (row: T) => string | number; // Like AG Grid's `valueGetter` — returns formatted value, Table displays it
    cellRenderer?: (row: T) => React.ReactNode; // Like AG Grid's `cellRenderer` — full custom JSX
    className?: string; // Optional class for the th/td
    hidden?: boolean; // Can be a boolean or a condition based on screen size (handled via className conventionally)
}

export interface TableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    keyExtractor: (row: T) => string | number;
    isLoading?: boolean;
    emptyStateMessage?: string;
    emptyStateSubMessage?: string;
    emptyStateIcon?: React.ReactNode;
    onRowClick?: (row: T) => void;
}

/**
 * Resolves cell content by priority: cellRenderer > valueGetter > accessorKey
 */
function resolveCell<T>(row: T, col: ColumnDef<T>): React.ReactNode {
    // 1. Custom JSX (badges, avatars, action buttons)
    if (col.cellRenderer) return col.cellRenderer(row);

    // 2. Formatted value (dates, computed strings) — Table displays as text
    if (col.valueGetter) return col.valueGetter(row);

    // 3. Direct property access — Table displays as text
    if (col.accessorKey) {
        const val = (row as Record<string, unknown>)[col.accessorKey as string];
        if (val === null || val === undefined) return '—';
        return val as React.ReactNode;
    }

    return null;
}

function Table<T>({
    data,
    columns,
    keyExtractor,
    isLoading = false,
    emptyStateMessage = 'No data found',
    emptyStateSubMessage = 'There are no records to display.',
    emptyStateIcon = <MdInbox className="text-4xl" />,
    onRowClick,
}: Readonly<TableProps<T>>) {
    const visibleColumns = columns.filter((col) => !col.hidden);

    if (isLoading) {
        return (
            <div className="p-8">
                <DataLoader />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 flex flex-col items-center gap-2">
                <div className="text-muted-dark">{emptyStateIcon}</div>
                <p className="text-text-light font-medium">{emptyStateMessage}</p>
                <p className="text-sm text-text-light">{emptyStateSubMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-light bg-muted-light/30">
                        {visibleColumns.map((col, index) => (
                            <th
                                key={index}
                                className={`text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-light/50">
                    {data.map((row) => (
                        <tr
                            key={keyExtractor(row)}
                            className={`hover:bg-muted-light/20 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(row)}
                        >
                            {visibleColumns.map((col, index) => (
                                <td key={index} className={`px-5 py-4 text-sm text-text-main ${col.className || ''}`}>
                                    {resolveCell(row, col)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
