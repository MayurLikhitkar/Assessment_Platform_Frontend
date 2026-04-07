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
import { ContentBox, Page, PageBody, PageFooter, PageHeader } from '../../../components/ui/Page';
import { useNavigate } from 'react-router-dom';
import Label from '../../../components/ui/Label';

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
        .typeError('Marks must be a number')
        .min(1, 'Marks must be at least 1')
        .max(100, 'Marks must not exceed 100')
        .integer('Marks must be a whole number')
        .required('Marks are required'),
    negativeMarks: Yup.number()
        .typeError('Negative marks must be a number')
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
        then: (schema) => schema.typeError('Must be a number').min(5, 'Minimum 5 minutes').max(180, 'Maximum 180 minutes').required('Time limit is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    memoryLimitInMB: Yup.number().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.typeError('Must be a number').min(256, 'Minimum 256 MB').max(1024, 'Maximum 1024 MB').required('Memory limit is required'),
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
                input: Yup.string().trim().required('Input is required'),
                expectedOutput: Yup.string().trim().required('Expected output is required'),
                points: Yup.number().typeError('Must be a number').min(1, 'Points must be at least 1').required('Points required'),
                isPublic: Yup.boolean().default(false)
            })
        ).min(1, 'At least one test case is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- QUERY Validation ---
    databaseType: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.oneOf(Object.values(DatabaseType), 'Invalid database type').required('Database type is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    databaseSchema: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.trim().min(10, 'Schema must be at least 10 characters').required('Database schema is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    expectedQuery: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.trim().min(5, 'Query must be at least 5 characters').required('Expected query is required'),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- SUBJECTIVE Validation ---
    minLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.typeError('Must be a number').min(1, 'Minimum 1 word').required('Min length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    maxLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.typeError('Must be a number').min(Yup.ref('minLength'), 'Max length must be >= min length').required('Max length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const CreateQuestion: React.FC = () => {
    const navigate = useNavigate();
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
            questionExplanation: '',
            marks: 1,
            negativeMarks: 0,
            difficulty: Difficulty.EASY,
            tags: [],
            hints: [],
            answerExplanation: '',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            timeLimitInMinutes: 30,
            memoryLimitInMB: 256,
            testCases: [],
            databaseType: DatabaseType.POSTGRESQL,
        },
        validationSchema: questionValidationSchema,
        validateOnChange: true,
        validateOnBlur: true,
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
        if (!item) {
            toast.error(`Please enter a ${field === 'tags' ? 'tag' : 'hint'} first`);
            return;
        }
        if (formik.values[field]?.includes(item)) {
            toast.error(`This ${field === 'tags' ? 'tag' : 'hint'} already exists`);
            return;
        }
        formik.setFieldValue(field, [...(formik.values[field] || []), item]);
        formik.setFieldTouched(field, true);
        setInput('');
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
            if (field === 'options' && list.length <= 2) {
                toast.error('At least 2 options are required');
                return;
            }
            formik.setFieldValue(field, list.filter((_, i) => i !== index));
        }
    };

    return (
        <Page>
            {/* Header */}
            <PageHeader>
                <BackButton variant='outline' />
                <div>
                    <h1 className="text-2xl font-semibold text-text-dark">Create Question</h1>
                    <p className="text-sm text-text-light">Fill in the details to create a new question</p>
                </div>
            </PageHeader>

            <PageBody>
                <form id='question-form' onSubmit={formik.handleSubmit} className="space-y-3">
                    {/* Base Question Details */}
                    <ContentBox className="grid sm:grid-cols-2 gap-6">
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
                    </ContentBox>
                    <ContentBox className="grid gap-6">
                        <FormTextArea id="question" name="question" label="Question Text" rows={4} formik={formik} placeholder="Enter the question here..." required />
                        <FormTextArea id="questionExplanation" name="questionExplanation" label="Question Explanation" rows={3} formik={formik} placeholder="Provide an explanation for the question (optional)" />
                    </ContentBox>

                    {/* Conditional Sections */}
                    {/* --- CONDITIONAL: CODING --- */}
                    {formik.values.type === QuestionType.MCQ && (
                        <ContentBox>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-text-main">MCQ Options</h3>
                                <Button type="button" variant='text' className="mt-2" onClick={() => formik.setFieldValue('options', [...(formik.values.options || []), { text: '', isCorrect: false }])}>
                                    <MdAdd className='text-xl' /> Add Option
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {formik.values.options && formik.values.options.length > 0 ? formik.values.options.map((option, index) => (
                                    <div key={index + 1} className="flex flex-col gap-1 w-full relative">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => updateDynamicList('options', index, 'isCorrect', e.target.checked)}
                                                className="cursor-pointer shrink-0"
                                                title="Mark as correct answer"
                                            />
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => updateDynamicList('options', index, 'text', e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className={Array.isArray(formik.errors.options) && (formik.errors.options as unknown as Record<string, string>[])[index]?.text ? 'ring-error-main! ring-2' : ''}
                                                />
                                            </div>
                                            <Button type="button" variant='icon' className='text-error-main shrink-0' onClick={() => removeDynamicItem('options', index)}>
                                                <MdClose className="text-xl" />
                                            </Button>
                                        </div>
                                        {Array.isArray(formik.errors.options) && (formik.errors.options as unknown as Record<string, string>[])[index]?.text && (
                                            <div className="text-xs text-error-main ml-8">{(formik.errors.options as unknown as Record<string, string>[])[index].text}</div>
                                        )}
                                    </div>
                                )) :
                                    <div className="text-sm text-text-light/80">No options added yet</div>
                                }
                            </div>
                            {typeof formik.errors.options === 'string' && <div className="text-sm text-error-main mt-2">{formik.errors.options}</div>}
                        </ContentBox>
                    )}

                    {/* --- CONDITIONAL: CODING --- */}
                    {formik.values.type === QuestionType.CODING && (
                        <ContentBox>
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
                        </ContentBox>
                    )}

                    {/* --- CONDITIONAL: QUERY --- */}
                    {formik.values.type === QuestionType.QUERY && (
                        <ContentBox>
                            <h3 className="font-semibold text-text-main">Database Details</h3>
                            <FormSelect
                                id="databaseType"
                                name="databaseType"
                                placeholder='Select database type'
                                label="Database Type"
                                options={Object.values(DatabaseType).map(db => ({ label: db.toUpperCase(), value: db }))}
                                formik={formik}
                                required
                            />
                            <FormTextArea id="databaseSchema" name="databaseSchema" label="Database Schema (SQL setup script)" rows={4} formik={formik} placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));" required />
                            <FormTextArea id="expectedQuery" name="expectedQuery" label="Expected Query (Correct Answer)" rows={3} formik={formik} placeholder="SELECT * FROM users WHERE age > 18;" required />
                        </ContentBox>
                    )}

                    {/* --- CONDITIONAL: SUBJECTIVE --- */}
                    {formik.values.type === QuestionType.SUBJECTIVE && (
                        <ContentBox>
                            <h3 className="font-semibold text-text-main">Subjective Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormInput id="minLength" name="minLength" label="Min Length (Words)" type="number" min={1} formik={formik} required />
                                <FormInput id="maxLength" name="maxLength" label="Max Length (Words)" type="number" min={1} formik={formik} required />
                            </div>
                        </ContentBox>
                    )}

                    {/* --- TAGS & HINTS --- */}
                    <ContentBox className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tags */}
                        <div>
                            <Label htmlFor="tags" label="Tags" required={true} />
                            <div className="flex gap-2">
                                <Input type="text" id='tags' value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (handleAddItem(tagInput, 'tags', setTagInput))} placeholder="Add tag and press Enter" />
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
                            <Label htmlFor="hints" label="Hints" />
                            <div className="flex gap-2">
                                <Input type="text" id='hints' value={hintInput} onChange={(e) => setHintInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(hintInput, 'hints', setHintInput))} placeholder="Add hint and press Enter" />
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
                    </ContentBox>

                    {/* --- FOOTER --- */}
                    {/* <div className="flex justify-end gap-3 pt-4 border-t border-border-light/50">
                    <Button type="button" variant="outline" size="md" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
                        Create Question
                    </Button>
                </div> */}
                </form>
            </PageBody>

            <PageFooter>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="question-form"
                    variant="primary"
                    loading={createMutation.isPending}
                    loadingText="Creating..."
                >
                    Create Question
                </Button>
            </PageFooter>
        </Page>
    );
};

export default CreateQuestion;