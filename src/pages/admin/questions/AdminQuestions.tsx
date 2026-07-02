import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MdAdd, MdQuiz } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { toast } from 'react-hot-toast';
import Confirmation from '../../../components/modal/Confirmation';
import { getQuestions, deleteQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { Difficulty, QuestionInterface } from '../../../types/questionTypes';
import { BsFillPatchQuestionFill } from 'react-icons/bs';
import AgGridTable from '../../../components/common/AgGridTable';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';
import DataLoader from '../../../components/common/DataLoader';
import ActionCell from '../../../components/common/ActionCell';

const AdminQuestions: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState<QuestionInterface | null>(null);

    // Fetch questions
    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const questions: QuestionInterface[] = questionsData?.data || [];

    const activeCount = questions.filter((q: QuestionInterface) => q.isActive).length;
    const inactiveCount = questions.filter((q: QuestionInterface) => !q.isActive).length;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteQuestion(id),
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
            cellClass: 'font-medium text-text-main',
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 110,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data?.type) return null;
                const type = params.data.type;
                return (
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase text-text-main bg-muted-main/50`}>
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
                if (!params.data?.difficulty) return null;
                const difficulty = params.data.difficulty;
                const colorMap: Record<Difficulty, string> = {
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
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Tags',
            field: 'tags',
            minWidth: 180,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data?.tags) return null;
                const tags = params.data.tags;
                return (
                    <div className="space-x-2">
                        {tags.map((tag, index) => (
                            <span
                                key={index + 1}
                                className="bg-secondary-light/20 text-secondary-main px-2 py-0.5 rounded text-xs uppercase font-semibold"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            headerName: 'Status',
            field: 'isActive',
            minWidth: 100,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return 'N/A';
                const isActive = params.data.isActive;
                return (
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${isActive
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
                    <ActionCell
                        onEdit={() => navigate(`/app/questions/${params.data?._id}/edit`)}
                        onDelete={() => setDeleteTarget(params.data!)}
                    />
                );
            },
        },
    ], [navigate]);

    return (
        <Page>
            <PageBody className='py-5'>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageTitle title="Questions" description="Create, manage, and organize questions" icon={MdQuiz} />
                    <Button
                        variant="primary"
                        onClick={() => navigate('/app/questions/create')}
                        className="flex items-center gap-2 shadow-sm"
                    >
                        <MdAdd className="text-xl" />
                        Add Question
                    </Button>
                </div>

                {isLoading ? (
                    <DataLoader />
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                                <div className="p-3 bg-secondary-light/20 rounded-lg text-secondary-main">
                                    <MdQuiz className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-main">{questions.length}</p>
                                    <p className="text-sm text-text-light">Total Questions</p>
                                </div>
                            </div>
                            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                                <div className="p-3 bg-success-light/30 rounded-lg text-success-main">
                                    <MdQuiz className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-main">{activeCount}</p>
                                    <p className="text-sm text-text-light">Active</p>
                                </div>
                            </div>
                            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                                <div className="p-3 bg-error-light/30 rounded-lg text-error-main">
                                    <MdQuiz className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-text-main">{inactiveCount}</p>
                                    <p className="text-sm text-text-light">Inactive</p>
                                </div>
                            </div>
                        </div>

                        {/* Questions Table */}
                        <AgGridTable<QuestionInterface>
                            rowData={questions}
                            columnDefs={columnDefs}
                        />
                    </>
                )}
            </PageBody>

            {/* Delete Confirmation Modal */}
            <Confirmation
                title=''
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                icon={BsFillPatchQuestionFill}
                message={`Are you sure you want to delete this question? "${deleteTarget?.question?.substring(0, 80)}${(deleteTarget?.question?.length || 0) > 80 ? '...' : ''}"`}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget._id);
                    }
                }}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </Page >
    );
};

export default AdminQuestions;
