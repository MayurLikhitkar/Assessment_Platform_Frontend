import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { MdClose, MdAdd } from 'react-icons/md';
import * as Yup from 'yup';
import FormInput from '../../../components/ui/FormInput';
import FormSelect from '../../../components/ui/FormSelect';
import FormTextArea from '../../../components/ui/FormTextArea';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { createQuestion } from '../../../services/axios/adminApi';

import type { ApiResponse } from '../../../types/types';
import { QuestionType, Difficulty, DatabaseType } from '../../../types/questionTypes';
import type { QuestionInterface } from '../../../types/questionTypes';
import BackButton from '../../../components/common/BackButton';

// Validation Schema with conditional branches based on Question Type
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
    negativeMarks: Yup.number()
        .min(0, 'Cannot be negative')
        .max(Yup.ref('marks'), 'Negative marks cannot exceed total marks')
        .default(0),
    difficulty: Yup.string()
        .oneOf(Object.values(Difficulty), 'Invalid difficulty')
        .required('Difficulty is required'),
    tags: Yup.array().of(Yup.string()).min(1, 'At least one tag is required'),
    explanation: Yup.string().max(2000, 'Explanation too long'),
    hints: Yup.array().of(Yup.string()),

    // --- MCQ Validation ---
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

    // --- CODING Validation ---
    timeLimitInMinutes: Yup.number().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.min(5).max(180).required('Time limit is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    memoryLimitInMB: Yup.number().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.min(256).max(1024).required('Memory limit is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    constraints: Yup.string().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.max(2000, 'Constraints too long'),
        otherwise: (schema) => schema.notRequired(),
    }),
    testCases: Yup.array().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.of(
            Yup.object().shape({
                input: Yup.string().required('Input is required'),
                expectedOutput: Yup.string().required('Expected output is required'),
                points: Yup.number().min(0).required('Points required'),
                isPublic: Yup.boolean().default(false)
            })
        ).min(1, 'At least one test case is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- QUERY Validation ---
    databaseType: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.required('Database type is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    databaseSchema: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.required('Database schema is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    expectedQuery: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.required('Expected query is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- SUBJECTIVE Validation ---
    minLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.min(1).required('Min length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    maxLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.min(Yup.ref('minLength'), 'Max length must be >= min length').required('Max length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const CreateQuestion: React.FC = () => {
    const queryClient = useQueryClient();
    const [tagInput, setTagInput] = useState('');
    const [hintInput, setHintInput] = useState('');

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
            negativeMarks: 0,
            difficulty: Difficulty.EASY,
            tags: [],
            hints: [],
            explanation: '',
            options: [
                // { text: '', isCorrect: false },
                // { text: '', isCorrect: false }
            ],
            timeLimitInMinutes: 5,
            memoryLimitInMB: 256,
            testCases: [],
            databaseType: DatabaseType.POSTGRESQL,
        },
        validationSchema: questionValidationSchema,
        onSubmit: (values) => {
            console.log("Submitting values: ", values);
            // Clean up payload based on type before sending
            const payload = { ...values };
            if (payload.type !== QuestionType.MCQ) delete payload.options;
            if (payload.type !== QuestionType.CODING) {
                delete payload.testCases;
                delete payload.timeLimitInMinutes;
                delete payload.memoryLimitInMB;
                delete payload.constraints;
            }
            if (payload.type !== QuestionType.QUERY) {
                delete payload.databaseType;
                delete payload.expectedQuery;
                delete payload.databaseSchema;
            }
            if (payload.type !== QuestionType.SUBJECTIVE) {
                delete payload.maxLength;
                delete payload.minLength;
            }

            // createMutation.mutate(payload as any);
        }
    });

    const handleClose = () => {
        formik.resetForm();
        setTagInput('');
        setHintInput('');
    };

    // --- Tag & Hint Handlers ---
    const handleAddItem = (input: string, field: 'tags' | 'hints', setInput: React.Dispatch<React.SetStateAction<string>>) => {
        const item = input.trim();
        if (item && !formik.values[field]?.includes(item)) {
            formik.setFieldValue(field, [...(formik.values[field] || []), item]);
            formik.setFieldTouched(field, true);
            setInput('');
        }
    };

    const handleRemoveItem = (item: string, field: 'tags' | 'hints') => {
        formik.setFieldValue(field, formik.values[field]?.filter(t => t !== item));
    };

    // --- Dynamic List Handlers ---
    const updateDynamicList = (field: string, index: number, key: string, value: number | string | boolean) => {
        formik.setFieldValue(`${field}[${index}].${key}`, value);
    };

    const removeDynamicItem = (field: keyof QuestionInterface, index: number) => {
        const list = formik.values[field];
        if (Array.isArray(list)) {
            formik.setFieldValue(field, list.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4">
                <BackButton />
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Create Question</h1>
                    <p className="text-sm text-gray-500">Fill in the details to create a new question</p>
                </div>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Base Question Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormSelect
                        id="type"
                        name="type"
                        label="Question Type"
                        options={Object.values(QuestionType).map(t => ({ label: t.toUpperCase(), value: t }))
                        }
                        formik={formik}
                        required
                    />
                    <FormSelect
                        id="difficulty"
                        name="difficulty"
                        label="Difficulty Level"
                        options={Object.values(Difficulty).map(d => ({ label: d.toUpperCase(), value: d }))
                        }
                        formik={formik}
                        required
                    />
                    <FormInput id="marks" name="marks" label="Marks" type="number" min={1} formik={formik} required />
                    <FormInput id="negativeMarks" name="negativeMarks" label="Negative Marks" type="number" min={0} step={0.5} formik={formik} />
                </div>

                <FormTextArea id="question" name="question" label="Question Text" rows={4} formik={formik} placeholder="Enter the question here..." required />
                <FormTextArea id="explanation" name="explanation" label="Explanation" rows={3} formik={formik} placeholder="Provide an explanation (optional)" />

                {/* Conditional Sections */}
                {formik.values.type === QuestionType.MCQ && (
                    <div className="bg-background-alt p-4 rounded-lg border border-border-light">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-text-main">MCQ Options</h3>
                            <Button type="button" variant='text' className="mt-2" onClick={() => formik.setFieldValue('options', [...(formik.values.options || []), { text: '', isCorrect: false }])}>
                                <MdAdd className='text-xl' /> Add Option
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {formik.values.options && formik.values.options.length > 0 ? formik.values.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => updateDynamicList('options', index, 'isCorrect', e.target.checked)}
                                        className="cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateDynamicList('options', index, 'text', e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <Button type="button" variant='icon' className='text-error-main' onClick={() => removeDynamicItem('options', index)}>
                                        <MdClose className="text-xl" />
                                    </Button>
                                </div>
                            )) :
                                <div className="text-sm text-text-light/80">No options added yet</div>
                            }
                        </div>
                        {typeof formik.errors.options === 'string' && <div className="text-sm text-error-main mt-2">{formik.errors.options}</div>}
                    </div>
                )}

                {/* --- CONDITIONAL: CODING --- */}
                {formik.values.type === QuestionType.CODING && (
                    <div className="bg-background-alt p-4 rounded-lg border border-border-light space-y-4">
                        <h3 className="font-semibold text-text-main mb-2">Coding Environment Specs</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput id="timeLimitInMinutes" name="timeLimitInMinutes" label="Time Limit (Minutes)" type="number" formik={formik} />
                            <FormInput id="memoryLimitInMB" name="memoryLimitInMB" label="Memory Limit (MB)" type="number" formik={formik} />
                        </div>
                        <FormTextArea id="constraints" name="constraints" label="Constraints" placeholder='Enter constraints (e.g. 1 <= N <= 10^5)' rows={2} formik={formik} />

                        <div className="mt-4">
                            <h4 className="font-semibold text-text-main mb-2">Test Cases</h4>
                            <div className="space-y-4">
                                {formik.values.testCases?.map((tc, index) => (
                                    <div key={index} className="flex gap-3 items-start border p-3 rounded-md bg-background-main">
                                        <div className="flex-1 space-y-2">
                                            <Input type="text" placeholder="Input (e.g. '5 10')" value={tc.input} onChange={(e) => updateDynamicList('testCases', index, 'input', e.target.value)} />
                                            <Input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => updateDynamicList('testCases', index, 'expectedOutput', e.target.value)} />
                                        </div>
                                        <div className="w-24 space-y-2">
                                            <Input type="number" placeholder="Points" value={tc.points} onChange={(e) => updateDynamicList('testCases', index, 'points', Number(e.target.value))} />
                                            <label className="flex items-center text-xs gap-1 mt-2">
                                                <Input type="checkbox" checked={tc.isPublic} onChange={(e) => updateDynamicList('testCases', index, 'isPublic', e.target.checked)} />
                                                Public
                                            </label>
                                        </div>
                                        <Button type="button" variant='icon' className='text-error-main' onClick={() => removeDynamicItem('testCases', index)}>
                                            <MdClose className="text-xl" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant='text' className="mt-2" onClick={() => formik.setFieldValue('testCases', [...(formik.values.testCases || []), { input: '', expectedOutput: '', isPublic: false, points: 10 }])}>
                                <MdAdd /> Add Test Case
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- CONDITIONAL: QUERY --- */}
                {formik.values.type === QuestionType.QUERY && (
                    <div className="bg-background-alt p-4 rounded-lg border border-border-light space-y-4">
                        <h3 className="font-semibold text-text-main mb-2">Database Details</h3>
                        <FormSelect
                            id="databaseType"
                            name="databaseType"
                            placeholder='Database Type'
                            label="Database Type"
                            options={Object.values(DatabaseType).map(db => ({ label: db.toUpperCase(), value: db }))}
                            formik={formik}
                        />
                        <FormTextArea id="databaseSchema" name="databaseSchema" label="Database Schema (SQL setup script)" rows={3} formik={formik} />
                        <FormTextArea id="expectedQuery" name="expectedQuery" label="Expected Query (Correct Answer)" rows={2} formik={formik} />
                    </div>
                )}

                {/* --- CONDITIONAL: SUBJECTIVE --- */}
                {formik.values.type === QuestionType.SUBJECTIVE && (
                    <div className="bg-background-alt p-4 rounded-lg border border-border-light space-y-4">
                        <h3 className="font-semibold text-text-main mb-2">Subjective Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput id="minLength" name="minLength" label="Min Length (Words)" type="number" formik={formik} />
                            <FormInput id="maxLength" name="maxLength" label="Max Length (Words)" type="number" formik={formik} />
                        </div>
                    </div>
                )}

                {/* --- TAGS & HINTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tags */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-main">Tags</label>
                        <div className="flex gap-2">
                            <Input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(tagInput, 'tags', setTagInput))} placeholder="Add tag and press Enter" />
                            <Button type="button" variant="primary" size="sm" onClick={() => handleAddItem(tagInput, 'tags', setTagInput)}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formik.values.tags?.map((tag) => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-primary-light/20 text-text-light">
                                    {tag}
                                    <MdClose className="text-2xl p-1 cursor-pointer rounded-full text-error-main! hover:bg-error-light/50" onClick={() => handleRemoveItem(tag, 'tags')}
                                    />
                                </span>
                            ))}
                        </div>
                        {formik.touched.tags && typeof formik.errors.tags === 'string' && <div className="text-xs text-error-main mt-1">{formik.errors.tags}</div>}
                    </div>

                    {/* Hints */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-text-main">Hints</label>
                        <div className="flex gap-2">
                            <Input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(hintInput, 'hints', setHintInput))} placeholder="Add hint and press Enter" />
                            <Button type="button" variant="primary" size="sm" onClick={() => handleAddItem(hintInput, 'hints', setHintInput)}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formik.values.hints?.map((hint) => (
                                <span key={hint} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-secondary-light/20 text-secondary-main">
                                    {hint}
                                    <MdClose className="text-2xl p-1 cursor-pointer rounded-full text-error-main! hover:bg-error-light/50" onClick={() => handleRemoveItem(hint, 'hints')}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-light/50">
                    <Button type="button" variant="outline" size="md" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                        Create Question
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuestion;