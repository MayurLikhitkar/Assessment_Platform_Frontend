import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    MdSearch, MdAdd, MdDelete, MdFilterList,
    MdClose, MdQuestionAnswer
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import DataLoader from '../../components/common/DataLoader';
import Button from '../../components/ui/Button';
import Confirmation from '../../components/modal/Confirmation';
import { getQuestions, createQuestion, deleteQuestion } from '../../services/axios/adminApi';
import type { Question, ApiResponse } from '../../types/types';
import { BsFillPatchQuestionFill } from 'react-icons/bs';

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

interface McqOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

const emptyQuestion: Partial<Question> = {
    type: 'mcq',
    question: '',
    marks: 1,
    difficulty: 'easy',
    categoryId: 1,
    tags: [],
    options: [
        { id: 1, text: '', isCorrect: false },
        { id: 2, text: '', isCorrect: false },
    ],
};

const AdminQuestions: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Question>>(emptyQuestion);
    const [tagInput, setTagInput] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);

    // Fetch questions
    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const questions = questionsData?.data || [];

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: Partial<Question>) => createQuestion(data),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Question created successfully');
                queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
                setShowCreateForm(false);
                setFormData(emptyQuestion);
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to create question');
        },
    });

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

    // Form handlers
    const handleFormChange = (field: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags?.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
    };

    const handleOptionChange = (index: number, field: keyof McqOption, value: string | boolean) => {
        const options = [...(formData.options || [])];
        options[index] = { ...options[index], [field]: value };
        setFormData(prev => ({ ...prev, options }));
    };

    const handleAddOption = () => {
        const options = [...(formData.options || [])];
        options.push({ id: options.length + 1, text: '', isCorrect: false });
        setFormData(prev => ({ ...prev, options }));
    };

    const handleRemoveOption = (index: number) => {
        const options = (formData.options || []).filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, options }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question?.trim()) {
            toast.error('Question text is required');
            return;
        }
        if (formData.type === 'mcq') {
            const hasCorrect = formData.options?.some(o => o.isCorrect);
            if (!hasCorrect) {
                toast.error('At least one option must be marked as correct');
                return;
            }
            const hasEmpty = formData.options?.some(o => !o.text.trim());
            if (hasEmpty) {
                toast.error('All options must have text');
                return;
            }
        }
        createMutation.mutate(formData);
    };

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

            {/* Create Question Form */}
            {showCreateForm && (
                <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6">
                    <h2 className="text-lg font-bold text-text-dark mb-4">New Question</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Row: Type + Difficulty + Marks */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="question-type" className="block text-sm font-medium text-text-main mb-1">Type</label>
                                <select
                                    id="question-type"
                                    value={formData.type}
                                    onChange={(e) => handleFormChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="coding">Coding</option>
                                    <option value="query">Query</option>
                                    <option value="subjective">Subjective</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="question-difficulty" className="block text-sm font-medium text-text-main mb-1">Difficulty</label>
                                <select
                                    id="question-difficulty"
                                    value={formData.difficulty}
                                    onChange={(e) => handleFormChange('difficulty', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="question-marks" className="block text-sm font-medium text-text-main mb-1">Marks</label>
                                <input
                                    id="question-marks"
                                    type="number"
                                    min={1}
                                    value={formData.marks}
                                    onChange={(e) => handleFormChange('marks', Number.parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                                />
                            </div>
                        </div>

                        {/* Question Text */}
                        <div>
                            <label htmlFor="question-text" className="block text-sm font-medium text-text-main mb-1">Question</label>
                            <textarea
                                id="question-text"
                                value={formData.question}
                                onChange={(e) => handleFormChange('question', e.target.value)}
                                rows={3}
                                placeholder="Enter your question here..."
                                className="w-full px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main placeholder-text-light/70 focus:outline-none focus:ring-2 focus:ring-primary-light/30 resize-none"
                            />
                        </div>

                        {/* MCQ Options */}
                        {formData.type === 'mcq' && (
                            <div>
                                <label htmlFor="mcq-options" className="block text-sm font-medium text-text-main mb-2">Options</label>
                                <div className="space-y-2">
                                    {formData.options?.map((option, index) => (
                                        <div key={option.id} className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                                    className="w-4 h-4 rounded border-border-light text-primary-main focus:ring-primary-light/30"
                                                />
                                                <span className="text-xs text-text-light">Correct</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1 px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main placeholder-text-light/70 focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                                            />
                                            {(formData.options?.length || 0) > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(index)}
                                                    className="p-1.5 text-error-main hover:bg-error-light/20 rounded-lg transition-colors"
                                                >
                                                    <MdClose className="text-lg" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="mt-2 text-sm text-primary-main hover:underline font-medium flex items-center gap-1"
                                >
                                    <MdAdd /> Add Option
                                </button>
                            </div>
                        )}

                        {/* Tags */}
                        <div>
                            <label htmlFor="tag-input" className="block text-sm font-medium text-text-main mb-1">Tags</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    id="tag-input"
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                    placeholder="Add a tag and press Enter"
                                    className="flex-1 px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main placeholder-text-light/70 focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                                />
                                <Button type="button" variant="primary" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                                    Add
                                </Button>
                            </div>
                            {formData.tags && formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map((tag) => (
                                        <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-secondary-light/20 text-secondary-dark">
                                            {tag}
                                            <MdClose className="cursor-pointer hover:text-error-main" onClick={() => handleRemoveTag(tag)} />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                onClick={() => { setShowCreateForm(false); setFormData(emptyQuestion); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                                Create Question
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search + Filters */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-xl" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-lg bg-background-main text-text-main placeholder-text-light/70 focus:outline-none focus:ring-2 focus:ring-primary-light/30 focus:border-primary-light transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <MdFilterList className="text-text-light text-xl" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2.5 border border-border-light rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                        >
                            <option value="all">All Types</option>
                            <option value="mcq">MCQ</option>
                            <option value="coding">Coding</option>
                            <option value="query">Query</option>
                            <option value="subjective">Subjective</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Questions Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        <DataLoader />
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted-light/50 border-b border-border-light">
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Question</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Difficulty</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Marks</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Tags</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {filteredQuestions.map((question: Question) => (
                                    <tr key={question.questionId} className="hover:bg-muted-light/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-text-dark line-clamp-2 max-w-[350px]">
                                                {question.question}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${typeColors[question.type] || 'bg-muted-light text-text-light'}`}>
                                                {question.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[question.difficulty] || 'bg-muted-light text-text-light'}`}>
                                                {question.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-dark">
                                            {question.marks}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {question.tags?.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-main">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {(question.tags?.length || 0) > 3 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted-light text-text-light">
                                                        +{question.tags!.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setDeleteTarget(question)}
                                                className="p-1.5 rounded-lg hover:bg-error-light/20 text-error-main transition-colors"
                                                title="Delete"
                                            >
                                                <MdDelete className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MdQuestionAnswer className="text-5xl text-muted-dark mx-auto mb-3" />
                        <p className="text-text-light font-medium">
                            {searchQuery || typeFilter !== 'all' ? 'No questions match your filters' : 'No questions found'}
                        </p>
                        <p className="text-sm text-text-light mt-1">
                            {searchQuery || typeFilter !== 'all' ? 'Try different search or filter' : 'Create your first question to get started'}
                        </p>
                    </div>
                )}
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
