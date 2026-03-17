import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';
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
import * as Yup from 'yup';

interface CreateQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const questionValidationSchema = Yup.object().shape({
    type: Yup.string()
        .oneOf(Object.values(QuestionType), 'Invalid question type')
        .required('Question type is required'),

    question: Yup.string()
        .trim()
        .min(10, 'Question must be at least 10 characters')
        .max(1000, 'Question must not exceed 1000 characters')
        .required('Question is required'),

    marks: Yup.number()
        .min(1, 'Marks must be at least 1')
        .max(100, 'Marks must not exceed 100')
        .integer('Marks must be a whole number')
        .required('Marks are required'),

    difficulty: Yup.string()
        .oneOf(Object.values(Difficulty), 'Invalid difficulty level')
        .required('Difficulty is required'),

    tags: Yup.array()
        .of(Yup.string().trim().min(1).max(30))
        .min(1, 'At least one tag is required')
        .max(10, 'Cannot add more than 10 tags')
        .required('Tags are required'),

    // ✅ Conditional: only validate options for MCQ type
    options: Yup.array().when('type', {
        is: QuestionType.MCQ,
        then: (schema) =>
            schema
                .of(
                    Yup.object().shape({
                        text: Yup.string()
                            .trim()
                            .min(1, 'Option text cannot be empty')
                            .max(500, 'Option text must not exceed 500 characters')
                            .required('Option text is required'),
                        isCorrect: Yup.boolean().required(),
                    })
                )
                .min(2, 'At least 2 options are required')
                .max(10, 'Cannot add more than 10 options')
                .test(
                    'at-least-one-correct',
                    'At least one option must be marked as correct',
                    (options) => options?.some((opt) => opt.isCorrect) ?? false
                )
                .test(
                    'at-least-one-incorrect',
                    'At least one option must be marked as incorrect (not all can be correct)',
                    (options) => options?.some((opt) => !opt.isCorrect) ?? false
                )
                .test(
                    'unique-options',
                    'All options must have unique text',
                    (options) => {
                        if (!options) return false;
                        const texts = options.map((o) => o.text?.trim().toLowerCase()).filter(Boolean);
                        return new Set(texts).size === texts.length;
                    }
                )
                .required('Options are required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    // ✅ For subjective/short-answer types (optional)
    correctAnswer: Yup.string().when('type', {
        is: (type: string) => type !== QuestionType.MCQ,
        then: (schema) =>
            schema
                .trim()
                .min(1, 'Correct answer is required')
                .max(2000, 'Answer must not exceed 2000 characters')
                .required('Correct answer is required for this question type'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [tagInput, setTagInput] = useState('');

    const createMutation = useMutation({
        mutationFn: createQuestion,
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
        initialValues: {
            type: QuestionType.MCQ,
            question: '',
            marks: 1,
            difficulty: Difficulty.EASY,
            tags: [],
            options: [
                // { text: '', isCorrect: false },
                // { text: '', isCorrect: false },
            ],
        },
        validationSchema: questionValidationSchema,
        onSubmit: (values) => {
            console.log(values)
            // createMutation.mutate(values);
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
            formik.setFieldTouched('tags', true);
            setTagInput('');
        }
    };

    const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tag: string) => {
        formik.setFieldValue('tags', formik.values.tags?.filter(t => t !== tag));
    };

    const handleOptionChange = (index: number, field: keyof Option, value: string | boolean) => {
        // const options = [...(formik.values.options || [])];
        // options[index] = { ...options[index], [field]: value } as Option;
        // formik.setFieldValue('options', options);
        formik.setFieldValue(`options[${index}].${field}`, value);
        formik.setFieldTouched(`options[${index}].${field}`, true);
    };

    const handleAddOption = () => {
        // const options = [...(formik.values.options || [])];
        // options.push({ text: '', isCorrect: false });
        // formik.setFieldValue('options', options);
        formik.setFieldValue('options', [...(formik.values.options || []), { text: '', isCorrect: false }]);
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
                        max={100}
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

                {formik.values.type === QuestionType.MCQ && (
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">Options</label>
                        <div className="space-y-3">
                            {formik.values.options?.map((option, index) => {
                                // Retrieve error specifically for this index
                                const fieldError = getIn(formik.errors, `options[${index}].text`);
                                const isTouched = getIn(formik.touched, `options[${index}].text`);

                                return (
                                    <div key={index} className="flex flex-col gap-1">
                                        <div className="flex items-start gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-2.5">
                                                <Input
                                                    type="checkbox"
                                                    checked={option.isCorrect}
                                                    onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                                    // Checkbox specific styling
                                                    className="cursor-pointer"
                                                />
                                                <span className="text-xs text-text-light">Correct</span>
                                            </label>

                                            <div className="w-full">
                                                <Input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                    onBlur={() => formik.setFieldTouched(`options[${index}].text`, true)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className={fieldError && isTouched ? 'ring-error-main!' : ''}
                                                />
                                                {/* Individual Option Error */}
                                                {fieldError && isTouched && (
                                                    <div className="text-xs text-error-main mt-1">{fieldError}</div>
                                                )}
                                            </div>

                                            {(formik.values.options?.length || 0) > 2 && (
                                                <Button
                                                    onClick={() => handleRemoveOption(index)}
                                                    variant='icon'
                                                    className='text-error-main! hover:bg-error-light/50 mt-1'
                                                    type="button"
                                                >
                                                    <MdClose className="text-lg" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Global Options Errors (Min count, Unique, At least one true/false) */}
                        {typeof formik.errors.options === 'string' && formik.touched.options && (
                            <div className="text-sm text-error-main mt-2 font-medium bg-error-light/10 p-2 rounded">
                                {formik.errors.options}
                            </div>
                        )}

                        <div className="mt-3">
                            <Button
                                type="button"
                                variant='text'
                                onClick={handleAddOption}
                            >
                                <MdAdd /> Add Option
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div>
                    <label htmlFor="tag-input" className="mb-2 block text-base font-medium text-text-main">Tags</label>
                    <div className="flex gap-2 items-center">
                        <Input
                            id="tag-input"
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            // This isn't the actual formik field, so we don't pass name="tags"
                            placeholder="Add a tag and press Enter"
                        />
                        <Button type="button" variant="primary" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                            Add
                        </Button>
                    </div>

                    {/* Tags List */}
                    {formik.values.tags && formik.values.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formik.values.tags.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-primary-light/20 text-text-light">
                                    {tag}
                                    <MdClose
                                        className="text-lg cursor-pointer hover:text-error-main"
                                        onClick={() => handleRemoveTag(tag)}
                                    />
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Tag Validation Errors */}
                    {formik.touched.tags && formik.errors.tags && typeof formik.errors.tags === 'string' && (
                        <div className="text-sm text-error-main mt-1">
                            {formik.errors.tags}
                        </div>
                    )}</div>

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
