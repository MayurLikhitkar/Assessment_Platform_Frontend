import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdFilterList, MdAdd } from 'react-icons/md';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams, GridReadyEvent, GridApi, RowClickedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { getQuestions } from '../../services/axios/adminApi';
import type { QuestionInterface } from '../../types/questionTypes';

ModuleRegistry.registerModules([AllCommunityModule]);

interface AddQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSelected: (questions: string[]) => void;
    existingQuestionIds: string[];
}

const typeColors: Record<string, string> = {
    mcq: 'bg-secondary-light/20 text-secondary-dark',
    coding: 'bg-accent-light/30 text-accent-dark',
    query: 'bg-warn-light/30 text-warn-dark',
    subjective: 'bg-muted-light text-dark-main',
};

const AddQuestionsModal: React.FC<AddQuestionsModalProps> = ({ isOpen, onClose, onAddSelected, existingQuestionIds }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const gridRef = React.useRef<GridApi<QuestionInterface> | null>(null);

    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
        enabled: isOpen,
    });

    const questions: QuestionInterface[] = questionsData?.data || [];

    const availableQuestions = questions.filter(q => !existingQuestionIds.includes(q._id));

    const filteredQuestions = availableQuestions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const onGridReady = useCallback((params: GridReadyEvent<QuestionInterface>) => {
        gridRef.current = params.api;
    }, []);

    const onRowClicked = useCallback((event: RowClickedEvent<QuestionInterface>) => {
        if (!event.data) return;
        const id = event.data._id;
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleAdd = () => {
        const selectedQuestions = questions.filter(q => selectedIds.has(q._id));
        onAddSelected(selectedQuestions);
        setSelectedIds(new Set());
        onClose();
    };

    const columnDefs = useMemo<ColDef<QuestionInterface>[]>(() => [
        {
            headerName: '',
            maxWidth: 50,
            filter: false,
            sortable: false,
            headerCheckboxSelection: true,
            checkboxSelection: true,
        },
        {
            headerName: 'Question',
            field: 'question',
            minWidth: 250,
            flex: 3,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                return (
                    <div>
                        <p className="text-sm font-medium text-text-main line-clamp-2">{params.data.question}</p>
                        <div className="flex gap-1 mt-1">
                            {params.data.tags?.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[10px] bg-muted-light/60 text-text-light px-1.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 100,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const type = params.data.type;
                return (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${typeColors[type] || 'bg-muted-light text-text-main'}`}>
                        {type}
                    </span>
                );
            },
        },
        {
            headerName: 'Marks',
            field: 'marks',
            minWidth: 80,
            flex: 0.5,
        },
    ], []);

    const defaultColDef = useMemo<ColDef>(() => ({
        filter: true,
        sortable: true,
        resizable: true,
    }), []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Questions from Question Bank" maxWidth="4xl">
            <div className="space-y-4">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-xl" />
                        <Input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <MdFilterList className="text-text-light text-xl" />
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            placeholder="All Types"
                            options={[
                                { label: 'All Types', value: 'all' },
                                { label: 'MCQ', value: 'mcq' },
                                { label: 'Coding', value: 'coding' },
                                { label: 'Query', value: 'query' },
                                { label: 'Subjective', value: 'subjective' },
                            ]}
                        />
                    </div>
                </div>

                {/* AG Grid Table */}
                <div className="h-[50vh] border border-border-light/50 rounded-lg overflow-hidden">
                    <AgGridReact<QuestionInterface>
                        rowData={filteredQuestions}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        onRowClicked={onRowClicked}
                        rowSelection="multiple"
                        enableCellTextSelection={true}
                        loading={isLoading}
                        overlayNoRowsTemplate="<span class='text-text-light'>No available questions match your criteria</span>"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border-light">
                    <p className="text-sm font-medium text-text-main">
                        {selectedIds.size} question(s) selected
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            disabled={selectedIds.size === 0}
                            onClick={handleAdd}
                            className="flex items-center gap-1"
                        >
                            <MdAdd /> Add Selected
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddQuestionsModal;
