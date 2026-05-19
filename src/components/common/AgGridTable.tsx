import { AgGridProvider, AgGridReact, type AgGridReactProps } from 'ag-grid-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { AllCommunityModule, type ColDef, type GridApi, type GridReadyEvent } from 'ag-grid-community';
import { MdDownload, MdFilterListOff } from 'react-icons/md';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import { paginationOptions } from '../../utils/config';
import Search from '../ui/Search';

// ModuleRegistry.registerModules([AllCommunityModule]);
const modules = [AllCommunityModule];

interface AgGridTableProps<T> extends AgGridReactProps {
    rowData: T[];
    columnDefs: ColDef[];
    actions?: React.ReactNode;
    hasSearch?: boolean;
    hasExport?: boolean;
    hasPageSize?: boolean;
    hasToolbar?: boolean;
}

const AgGridTable = <T,>({ rowData, columnDefs, actions, hasSearch = true, hasExport = true, hasPageSize = true, hasToolbar = true, ...props }: AgGridTableProps<T>) => {
    const gridRef = useRef<GridApi<T> | null>(null);
    const [paginationPageSize, setPaginationPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');

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

    const onPageSizeChanged = useCallback((value: string | number | boolean) => {
        if (!gridRef.current) return;

        const size = value === 'All'
            ? gridRef.current.getDisplayedRowCount()
            : Number(value);

        setPaginationPageSize(size);
        gridRef.current.paginationGoToPage(0);
    }, []);

    const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);
        gridRef.current?.setGridOption('quickFilterText', value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchText('');
        gridRef.current?.setGridOption('quickFilterText', '');
    }, []);

    return (
        <div className="space-y-3 relative overflow-hidden">
            {/* Filter, page size, search and export */}
            {hasToolbar && <div className="flex justify-between items-center bg-background-light p-2 md:p-3 border border-border-light/80 shadow-sm rounded-xl">
                {hasSearch && <div className="flex gap-2 items-center">
                    <Search value={searchText} onChange={onSearchChange} handleClear={handleClearSearch} />
                    {actions}
                </div>}
                <div className="flex gap-2 items-center">
                    {hasExport && <Tooltip text="Download CSV" position='bottom'>
                        <Button type="button" variant="outline" size='md' disabled={rowData.length === 0} onClick={exportCSV}>
                            <MdDownload className="text-lg" />
                        </Button>
                    </Tooltip>}
                    <Tooltip text="Clear Filters & Sorting" position='bottom'>
                        <Button type="button" variant="outline" size='md' disabled={rowData.length === 0} onClick={clearAllFilters}>
                            <MdFilterListOff className="text-lg" />
                        </Button>
                    </Tooltip>
                    {hasPageSize && <Select
                        value={paginationOptions.includes(paginationPageSize) ? paginationPageSize.toString() : "All"}
                        options={paginationOptions.map((size) => ({
                            label: size.toString(),
                            value: size.toString(),
                        }))}
                        placeholder=""
                        className="max-w-[80px] py-1"
                        onChange={onPageSizeChanged}
                    />}
                </div>
            </div>}
            <AgGridProvider modules={modules}>
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
            </AgGridProvider>
        </div>
    )
}

export default AgGridTable;