import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { MdClose, MdAdd } from 'react-icons/md';
import Modal from '../../../components/ui/Modal';
import FormInput from '../../../components/ui/FormInput';
import FormSelect from '../../../components/ui/FormSelect';
import FormTextArea from '../../../components/ui/FormTextArea';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { createQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import { QuestionType, Difficulty } from '../../../types/questionTypes';
import type { QuestionInterface, Option } from '../../../types/questionTypes';

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
}


const emptyQuestion: Partial<QuestionInterface> = {
    type: QuestionType.MCQ,
    question: '',
    marks: 1,
    difficulty: Difficulty.EASY,
    tags: [],
    options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ],
};

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [tagInput, setTagInput] = useState('');

    const createMutation = useMutation({
        mutationFn: (data: Partial<QuestionInterface>) => createQuestion(data),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Question created successfully');
                queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
                handleClose();
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to create question');
        },
    });

    const formik = useFormik<Partial<QuestionInterface>>({
        initialValues: emptyQuestion,
        onSubmit: (values) => {
            if (!values.question?.trim()) {
                toast.error('Question text is required');
                return;
            }
            if (values.type === 'mcq') {
                const hasCorrect = values.options?.some(o => o.isCorrect);
                if (!hasCorrect) {
                    toast.error('At least one option must be marked as correct');
                    return;
                }
                const hasEmpty = values.options?.some(o => !o.text.trim());
                if (hasEmpty) {
                    toast.error('All options must have text');
                    return;
                }
            }
            createMutation.mutate(values);
        }
    });

    const handleClose = () => {
        formik.resetForm();
        setTagInput('');
        onClose();
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formik.values.tags?.includes(tag)) {
            formik.setFieldValue('tags', [...(formik.values.tags || []), tag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        formik.setFieldValue('tags', formik.values.tags?.filter(t => t !== tag));
    };

    const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
        const options = [...(formik.values.options || [])];
        options[index] = { ...options[index], [field]: value } as Option;
        formik.setFieldValue('options', options);
    };

    const handleAddOption = () => {
        const options = [...(formik.values.options || [])];
        options.push({ text: '', isCorrect: false });
        formik.setFieldValue('options', options);
    };

    const handleRemoveOption = (index: number) => {
        const options = (formik.values.options || []).filter((_, i) => i !== index);
        formik.setFieldValue('options', options);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Question" maxWidth="2xl">
            <form onSubmit={formik.handleSubmit} className="space-y-5 pt-2">
                {/* Row: Type + Difficulty + Marks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormSelect
                        id="type"
                        name="type"
                        label="Type"
                        placeholder="Select Type"
                        options={[
                            { label: 'MCQ', value: 'mcq' },
                            { label: 'Coding', value: 'coding' },
                            { label: 'Query', value: 'query' },
                            { label: 'Subjective', value: 'subjective' },
                        ]}
                        formik={formik}
                        required
                    />
                    <FormSelect
                        id="difficulty"
                        name="difficulty"
                        label="Difficulty"
                        placeholder="Select Difficulty"
                        options={[
                            { label: 'Easy', value: 'easy' },
                            { label: 'Medium', value: 'medium' },
                            { label: 'Hard', value: 'hard' },
                        ]}
                        formik={formik}
                        required
                    />
                    <FormInput
                        id="marks"
                        name="marks"
                        label="Marks"
                        type="number"
                        min={1}
                        formik={formik}
                        required
                    />
                </div>

                {/* Question Text */}
                <FormTextArea
                    id="question"
                    name="question"
                    label="Question text"
                    placeholder="Enter your question here..."
                    rows={3}
                    formik={formik}
                    required
                />

                {/* MCQ Options */}
                {formik.values.type === 'mcq' && (
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">Options</label>
                        <div className="space-y-2">
                            {formik.values.options?.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                            className="w-4 h-4 rounded border-border-light text-primary-main focus:ring-primary-light/30"
                                        />
                                        <span className="text-xs text-text-light">Correct</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    {(formik.values.options?.length || 0) > 2 && (
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
                        <Input
                            id="tag-input"
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                            placeholder="Add a tag and press Enter"
                        />
                        <Button type="button" variant="primary" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                            Add
                        </Button>
                    </div>
                    {formik.values.tags && formik.values.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formik.values.tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-secondary-light/20 text-secondary-dark">
                                    {tag}
                                    <MdClose className="cursor-pointer hover:text-error-main" onClick={() => handleRemoveTag(tag)} />
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-light/50">
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                        Create Question
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateQuestionModal;
