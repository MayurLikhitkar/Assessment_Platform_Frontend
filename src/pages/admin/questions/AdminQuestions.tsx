import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdd, MdDelete, MdQuiz, MdVisibility, MdEdit } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { toast } from 'react-hot-toast';
import Confirmation from '../../../components/modal/Confirmation';
import { getQuestions, deleteQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { QuestionInterface } from '../../../types/questionTypes';
import { BsFillPatchQuestionFill } from 'react-icons/bs';
import AgGridTable from '../../../components/common/AgGridTable';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';

const AdminQuestions: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<QuestionInterface | null>(null);

    // Fetch questions
    const { data: questionsData } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const questions: QuestionInterface[] = questionsData?.data || [];

    const activeCount = questions.filter((q: QuestionInterface) => q.isActive).length;
    const inactiveCount = questions.filter((q: QuestionInterface) => !q.isActive).length;

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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase `}>
                        {type}
                    </span>
                );
            },
        },
        {
            headerName: 'Difficulty',
            field: 'difficulty',
            minWidth: 130,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const difficulty = params.data.difficulty;
                const colorMap = {
                    easy: 'text-success-main bg-success-main/10',
                    medium: 'text-primary-main bg-primary-main/10',
                    hard: 'text-error-main bg-error-main/10',
                };
                return (
                    <span className={`${colorMap[difficulty]} px-2 py-1 text-xs font-semibold capitalize rounded-md`}>
                        {difficulty}
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
            headerName: 'Status',
            field: 'isActive',
            minWidth: 100,
            flex: 0.7,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const isActive = params.data.isActive;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-success-light/40 text-success-dark'
                        : 'bg-error-light/40 text-error-dark'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            headerName: 'Actions',
            minWidth: 120,
            maxWidth: 120,
            filter: false,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            className="p-1.5 rounded-lg hover:bg-secondary-light/20 text-secondary-main transition-colors"
                            title="View Details"
                        >
                            <MdVisibility className="text-lg" />
                        </button>
                        <button
                            className="p-1.5 rounded-lg hover:bg-primary-light/10 text-primary-main transition-colors"
                            title="Edit"
                        >
                            <MdEdit className="text-lg" />
                        </button>
                        <button
                            onClick={() => setDeleteTarget(params.data!)}
                            className="p-1.5 rounded-lg hover:bg-error-light/20 text-error-main transition-colors"
                            title="Delete"
                        >
                            <MdDelete className="text-lg" />
                        </button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <Page>
            <PageBody className='py-5'>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageTitle title="Questions" description="Create, manage, and organize questions" icon={MdQuiz} />
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/questions/create')}
                        className="flex items-center gap-2 shadow-sm"
                    >
                        <MdAdd className="text-xl" />
                        Add Question
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-secondary-light/20 rounded-lg text-secondary-main">
                            <MdQuiz className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{questions.length}</p>
                            <p className="text-sm text-text-light">Total Questions</p>
                        </div>
                    </div>
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-success-light/30 rounded-lg text-success-main">
                            <MdQuiz className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{activeCount}</p>
                            <p className="text-sm text-text-light">Active</p>
                        </div>
                    </div>
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-error-light/30 rounded-lg text-error-main">
                            <MdQuiz className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{inactiveCount}</p>
                            <p className="text-sm text-text-light">Inactive</p>
                        </div>
                    </div>
                </div>

                {/* Questions Table */}
                <AgGridTable<QuestionInterface>
                    rowData={questions}
                    columnDefs={columnDefs}
                />
            </PageBody>

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
        </Page>
    );
};

export default AdminQuestions;
