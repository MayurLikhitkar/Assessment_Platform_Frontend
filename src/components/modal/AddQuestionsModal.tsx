import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdFilterList, MdAdd } from 'react-icons/md';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import DataLoader from '../common/DataLoader';
import { getQuestions } from '../../services/axios/adminApi';
import type { Question } from '../../types/types';

interface AddQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSelected: (questions: Question[]) => void;
    existingQuestionIds: number[];
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
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const { data: questionsData, isLoading } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
        enabled: isOpen,
    });

    const questions: Question[] = questionsData?.data || [];

    const availableQuestions = questions.filter(q => !existingQuestionIds.includes(q.questionId));

    const filteredQuestions = availableQuestions.filter(q => {
        const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || q.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const toggleSelection = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleAdd = () => {
        const selectedQuestions = questions.filter(q => selectedIds.has(q.questionId));
        onAddSelected(selectedQuestions);
        setSelectedIds(newSet => { newSet.clear(); return newSet; });
        onClose();
    };

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
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 border border-border-light rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                        >
                            <option value="all">All Types</option>
                            <option value="mcq">MCQ</option>
                            <option value="coding">Coding</option>
                            <option value="query">Query</option>
                            <option value="subjective">Subjective</option>
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="border border-border-light/50 rounded-lg overflow-hidden h-[50vh] flex flex-col">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 h-full">
                            <DataLoader />
                        </div>
                    ) : filteredQuestions.length > 0 ? (
                        <div className="overflow-y-auto custom-scrollbar flex-1 bg-background-light">
                            <table className="w-full text-left">
                                <thead className="bg-muted-light/50 sticky top-0 z-10 border-b border-border-light shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-border-light text-primary-main focus:ring-primary-main focus:ring-2"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds(new Set(filteredQuestions.map(q => q.questionId)));
                                                    } else {
                                                        setSelectedIds(new Set());
                                                    }
                                                }}
                                                checked={filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">Question</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider w-24">Type</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-text-light uppercase tracking-wider w-24">Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light/50">
                                    {filteredQuestions.map(q => (
                                        <tr key={q.questionId} className={`hover:bg-muted-light/30 cursor-pointer transition-colors ${selectedIds.has(q.questionId) ? 'bg-primary-light/5' : ''}`} onClick={() => toggleSelection(q.questionId)}>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border-light text-primary-main focus:ring-primary-main focus:ring-2 pointer-events-none"
                                                    checked={selectedIds.has(q.questionId)}
                                                    readOnly
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-text-dark line-clamp-2">{q.question}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {q.tags?.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="text-[10px] bg-muted-light/60 text-text-light px-1.5 py-0.5 rounded-full">{tag}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${typeColors[q.type] || 'bg-muted-light text-text-main'}`}>{q.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-main font-medium">
                                                {q.marks}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 h-full bg-background-light text-center">
                            <p className="text-text-main font-medium">No available questions match your criteria</p>
                            <p className="text-sm text-text-light mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
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
