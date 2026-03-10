import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    MdSearch, MdAdd, MdDelete, MdFilterList,
    MdClose, MdQuestionAnswer
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Confirmation from '../../../components/modal/Confirmation';
import { getQuestions, deleteQuestion } from '../../../services/axios/adminApi';
import type { Question, ApiResponse } from '../../../types/types';
import { BsFillPatchQuestionFill } from 'react-icons/bs';
import Table from '../../../components/ui/Table';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

    // Fetch questions
    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const questions = questionsData?.data || [];

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

    // Filter questions
    const filteredQuestions = questions.filter((q: Question) => {
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        return matchesSearch && matchesType;
    });

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

            {/* Search + Filters */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
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
                            id="typeFilter"
                            name="typeFilter"
                            value={typeFilter}
                            placeholder="All Types"
                            onChange={(e) => setTypeFilter(e.target.value)}
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
            </div>

            {/* Questions Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                <Table<Question>
                    data={filteredQuestions}
                    isLoading={isLoading}
                    keyExtractor={(q) => q.questionId}
                    emptyStateMessage={searchQuery || typeFilter !== 'all' ? 'No questions match your filters' : 'No questions found'}
                    emptyStateSubMessage={searchQuery || typeFilter !== 'all' ? 'Try different search or filter' : 'Create your first question to get started'}
                    emptyStateIcon={<MdQuestionAnswer className="text-5xl text-muted-dark mx-auto mb-3" />}
                    columns={[
                        {
                            header: 'Question',
                            accessorKey: 'question',
                            render: (q) => (
                                <p className="text-sm text-text-dark line-clamp-2 max-w-[350px]">
                                    {q.question}
                                </p>
                            )
                        },
                        {
                            header: 'Type',
                            accessorKey: 'type',
                            render: (q) => (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeColors[q.type] || 'bg-muted-light text-text-light'}`}>
                                    {q.type}
                                </span>
                            )
                        },
                        {
                            header: 'Difficulty',
                            accessorKey: 'difficulty',
                            render: (q) => (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[q.difficulty] || 'bg-muted-light text-text-light'}`}>
                                    {q.difficulty}
                                </span>
                            )
                        },
                        {
                            header: 'Marks',
                            accessorKey: 'marks',
                            render: (q) => (
                                <span className="text-sm font-medium text-text-dark">
                                    {q.marks}
                                </span>
                            )
                        },
                        {
                            header: 'Tags',
                            accessorKey: 'tags',
                            render: (q) => (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {q.tags?.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-main">
                                            {tag}
                                        </span>
                                    ))}
                                    {(q.tags?.length || 0) > 3 && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-light">
                                            +{(q.tags?.length || 0) - 3}
                                        </span>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Actions',
                            render: (q) => (
                                <button
                                    onClick={() => setDeleteTarget(q)}
                                    className="p-1.5 rounded-lg hover:bg-error-light/20 text-error-main transition-colors"
                                    title="Delete"
                                >
                                    <MdDelete className="text-lg" />
                                </button>
                            )
                        }
                    ]}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <Confirmation
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                icon={BsFillPatchQuestionFill}
                message={`Are you sure you want to delete this question? "${deleteTarget?.question?.substring(0, 80)}${(deleteTarget?.question?.length || 0) > 80 ? '...' : ''}"`}
                onConfirm={() => {
                    if (deleteTarget) {
                        deleteMutation.mutate(deleteTarget.questionId);
                    }
                }}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default AdminQuestions;
