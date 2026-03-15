import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdd, MdDelete, MdClose } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { toast } from 'react-hot-toast';
import Confirmation from '../../../components/modal/Confirmation';
import { getQuestions, deleteQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { QuestionInterface } from '../../../types/questionTypes';
import { BsFillPatchQuestionFill } from 'react-icons/bs';
import AgGridTable from '../../../components/common/AgGridTable';
import CreateQuestionModal from './CreateQuestionModal';

const typeColors: Record<string, string> = {
    mcq: 'bg-secondary-light/20 text-secondary-dark',
    coding: 'bg-accent-light/30 text-accent-dark',
    query: 'bg-warn-light/30 text-warn-dark',
    subjective: 'bg-muted-light text-dark-main',
};

const difficultyColors: Record<string, string> = {
    easy: 'bg-success-light/40 text-success-dark',
    medium: 'bg-warn-light/40 text-warn-dark',
    hard: 'bg-error-light/40 text-error-dark',
};

const AdminQuestions: React.FC = () => {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<QuestionInterface | null>(null);

    // Fetch questions
    const { data: questionsData } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const questions: QuestionInterface[] = questionsData?.data || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteQuestion(id),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Question deleted');
                queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
            }
            setDeleteTarget(null);
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to delete question');
            setDeleteTarget(null);
        },
    });

    const columnDefs = useMemo<ColDef<QuestionInterface>[]>(() => [
        {
            headerName: 'Question',
            field: 'question',
            minWidth: 250,
            flex: 3,
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 110,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const type = params.data.type;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeColors[type] || 'bg-muted-light text-text-light'}`}>
                        {type}
                    </span>
                );
            },
        },
        {
            headerName: 'Difficulty',
            field: 'difficulty',
            minWidth: 120,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const diff = params.data.difficulty;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[diff] || 'bg-muted-light text-text-light'}`}>
                        {diff}
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
        {
            headerName: 'Tags',
            field: 'tags',
            minWidth: 180,
            flex: 2,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const tags = params.data.tags;
                return (
                    <div className="flex flex-wrap gap-1">
                        {tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-main">
                                {tag}
                            </span>
                        ))}
                        {(tags?.length || 0) > 3 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-light">
                                +{(tags?.length || 0) - 3}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            headerName: 'Actions',
            minWidth: 80,
            maxWidth: 80,
            filter: false,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                return (
                    <button
                        onClick={() => setDeleteTarget(params.data!)}
                        className="p-1.5 rounded-lg hover:bg-error-light/20 text-error-main transition-colors"
                        title="Delete"
                    >
                        <MdDelete className="text-lg" />
                    </button>
                );
            },
        },
    ], []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">Question Bank</h1>
                    <p className="text-text-light mt-1">Create, manage, and organize questions</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? <MdClose className="text-xl" /> : <MdAdd className="text-xl" />}
                    {showCreateForm ? 'Cancel' : 'Create Question'}
                </button>
            </div>

            <CreateQuestionModal
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
            />

            {/* Questions Table */}
            <AgGridTable<QuestionInterface>
                rowData={questions}
                columnDefs={columnDefs}
            />

            {/* Delete Confirmation Modal */}
            <Confirmation
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                icon={BsFillPatchQuestionFill}
                message={`Are you sure you want to delete this question? "${deleteTarget?.question?.substring(0, 80)}${(deleteTarget?.question?.length || 0) > 80 ? '...' : ''}"`}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget.id);
                    }
                }}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default AdminQuestions;
