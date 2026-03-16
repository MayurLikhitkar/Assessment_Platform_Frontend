import { AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AllCommunityModule, ModuleRegistry, type ColDef, type GridApi, type GridReadyEvent } from 'ag-grid-community';
import { MdDownload, MdFilterListOff } from 'react-icons/md';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { paginationOptions } from '../../utils/config';

ModuleRegistry.registerModules([AllCommunityModule]);

interface AgGridTableProps<T> extends AgGridReactProps {
    leftSection?: React.ReactNode;
    rowData: T[];
    columnDefs: ColDef[];
}

const AgGridTable = <T,>({ rowData, columnDefs, leftSection, ...props }: AgGridTableProps<T>) => {
    const gridRef = useRef<GridApi<T> | null>(null);
    const [paginationPageSize, setPaginationPageSize] = useState(10);

    const onGridReady = useCallback((params: GridReadyEvent<T>) => {
        gridRef.current = params.api;
    }, []);

    const defaultColDef = useMemo<ColDef>(() => ({
        filter: true,
        sortable: true,
        resizable: true,
        tooltipValueGetter: (params) => params.value
    }), []);

    const clearAllFilters = () => {
        if (gridRef.current) {
            gridRef.current.setFilterModel(null);
            gridRef.current.applyColumnState({ defaultState: { sort: null } });
        }
    };

    const exportCSV = () => {
        if (gridRef.current) {
            gridRef.current.exportDataAsCsv();
        }
    };

    const onPageSizeChanged = useCallback((value: string | number) => {
        if (!gridRef.current) return;

        const size = value === 'All'
            ? gridRef.current.getDisplayedRowCount()
            : Number(value);

        setPaginationPageSize(size);
        gridRef.current.paginationGoToPage(0);
    }, []);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap bg-background-light p-2 md:p-3 border border-border-light/30 shadow-sm rounded-lg">
                {leftSection}
                <Select
                    value={paginationOptions.includes(paginationPageSize) ? paginationPageSize.toString() : "All"}
                    options={paginationOptions.map((size) => ({
                        label: size.toString(),
                        value: size.toString(),
                    }))}
                    placeholder=""
                    className="max-w-[80px]"
                    onChange={onPageSizeChanged}
                />
                <Tooltip text="Download CSV">
                    <Button variant="outline" disabled={rowData.length === 0} onClick={exportCSV}>
                        <MdDownload className="text-lg" />
                    </Button>
                </Tooltip>
                <Tooltip text="Clear Filters & Sorting">
                    <Button variant="outline" disabled={rowData.length === 0} onClick={clearAllFilters}>
                        <MdFilterListOff className="text-lg" />
                    </Button>
                </Tooltip>
            </div>
            <div className="h-[50vh] shadow-sm rounded-lg">
                <AgGridReact<T>
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={paginationPageSize}
                    onGridReady={onGridReady}
                    paginationPageSizeSelector={false}
                    enableCellTextSelection={true}
                    tooltipTrigger='hover'
                    {...props}
                />
            </div>
        </div>
    )
}

export default AgGridTable;