import React from 'react';
import { MdInbox } from 'react-icons/md';
import DataLoader from '../common/DataLoader';

export interface ColumnDef<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T | string;
    render?: (row: T) => React.ReactNode;
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
                                <td key={index} className={`px-5 py-4 ${col.className || ''}`}>
                                    {col.render
                                        ? col.render(row)
                                        : col.accessorKey
                                            ? (row as any)[col.accessorKey]
                                            : null}
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
