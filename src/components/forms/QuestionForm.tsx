import React from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { MdClose, MdAdd } from 'react-icons/md';
import * as Yup from 'yup';

import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormTextArea from '../ui/FormTextArea';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FormMultiInput from '../ui/FormMultiInput';
import FormMultiClick from '../ui/FormMultiClick';
import { ContentBox, PageFooter } from '../ui/Page';

import { QuestionType, Difficulty, DatabaseType, ProgrammingLanguage } from '../../types/questionTypes';
import type { FormQuestionInterface, QuestionInterface } from '../../types/questionTypes';

// Validation Schema with conditional branches based on Question Type
const questionValidationSchema = Yup.object().shape({
    type: Yup.string()
        .oneOf(Object.values(QuestionType), 'Invalid question type')
        .required('Question type is required'),
    question: Yup.string()
        .trim()
        .min(5, 'Question must be at least 5 characters')
        .max(2000, 'Question must not exceed 2000 characters')
        .required('Question is required'),
    questionExplanation: Yup.string()
        .trim()
        .min(10, 'Question explanation must be at least 10 characters')
        .max(3000, 'Question explanation must not exceed 3000 characters'),
    answerExplanation: Yup.string()
        .trim()
        .min(10, 'Answer explanation must be at least 10 characters')
        .max(2000, 'Answer explanation must not exceed 2000 characters'),
    marks: Yup.number()
        .min(1, 'Marks must be at least 1')
        .max(100, 'Marks must not exceed 100')
        .integer('Marks must be a whole number')
        .required('Marks are required'),
    negativeMarks: Yup.number()
        .min(0, 'Cannot be less than 0')
        .max(Yup.ref('marks'), 'Negative marks cannot exceed total marks')
        .default(0),
    timeLimitInSeconds: Yup.number()
        .min(5, 'Minimum 5 seconds')
        .max(7200, 'Maximum 7200 seconds')
        .integer('Time limit must be a whole number')
        .notRequired(),
    difficulty: Yup.string()
        .oneOf(Object.values(Difficulty), 'Invalid difficulty')
        .required('Difficulty is required'),
    tags: Yup.array().of(Yup.string().trim().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required').required('Tags are required'),
    hints: Yup.array().of(Yup.string().trim().min(1, 'Hint cannot be empty')).notRequired(),

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
                    'single-correct-when-not-multiselect',
                    'Only one option can be marked as correct when multi-select is disabled',
                    function (options) {
                        const { isMultiSelect } = this.parent;
                        if (isMultiSelect || !options) return true;
                        return options.filter((opt) => opt.isCorrect).length === 1;
                    }
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
    isMultiSelect: Yup.boolean().when('type', {
        is: QuestionType.MCQ,
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- CODING Validation ---
    programmingLanguages: Yup.array().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.of(Yup.string().oneOf(Object.values(ProgrammingLanguage))).min(1, 'At least one programming language required').required('Languages are required for coding questions'),
        otherwise: (schema) => schema.notRequired(),
    }),
    memoryLimitInMB: Yup.number().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.typeError('Must be a number').min(128, 'Minimum 128 MB').max(512, 'Maximum 512 MB').notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    constraints: Yup.array().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.of(Yup.string().trim().min(1, 'Constraint cannot be empty')).notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    testCases: Yup.array().when('type', {
        is: QuestionType.CODING,
        then: (schema) => schema.of(
            Yup.object().shape({
                input: Yup.string().trim().required('Input is required'),
                expectedOutput: Yup.string().trim().required('Expected output is required'),
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
        then: (schema) => schema.trim().min(10, 'Schema must be at least 10 characters').notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    expectedQuery: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.trim().min(5, 'Query must be at least 5 characters').max(500, 'Query must not exceed 500 characters').required('Expected query is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    sampleData: Yup.string().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.trim().max(10000, 'Sample Data must not exceed 10000 characters').notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    allowedKeywords: Yup.array().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.of(Yup.string().trim().min(1, 'Keyword cannot be empty')).notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    forbiddenKeywords: Yup.array().when('type', {
        is: QuestionType.QUERY,
        then: (schema) => schema.of(Yup.string().trim().min(1, 'Keyword cannot be empty')).notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),

    // --- SUBJECTIVE Validation ---
    minLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.typeError('Must be a number').min(1, 'Minimum 1 character').required('Min length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    maxLength: Yup.number().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.typeError('Must be a number').min(Yup.ref('minLength'), 'Max length must be >= min length').required('Max length is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
    expectedKeywords: Yup.array().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.of(Yup.string().trim().min(1, 'Keyword cannot be empty')).min(1, 'At least one keyword is required').required(),
        otherwise: (schema) => schema.notRequired(),
    }),
    sampleAnswer: Yup.string().when('type', {
        is: QuestionType.SUBJECTIVE,
        then: (schema) => schema.trim().max(2000, 'Sample Answer must not exceed 2000 characters').notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
});

interface QuestionFormProps {
    initialValues: Partial<FormQuestionInterface>;
    onSubmit: (values: Partial<QuestionInterface>) => void;
    handleCancel: () => void;
    isLoading: boolean;
    isEditMode?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
    initialValues,
    onSubmit,
    handleCancel,
    isLoading,
    isEditMode = false
}) => {
    const formik = useFormik<Partial<FormQuestionInterface>>({
        initialValues,
        enableReinitialize: true,
        validationSchema: questionValidationSchema,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: (values) => {
            console.log("Submitting values: ", values);
            const { type } = values;
            const payload: Partial<QuestionInterface> = {
                type,
                question: values.question,
                questionExplanation: values.questionExplanation,
                answerExplanation: values.answerExplanation,
                marks: values.marks,
                negativeMarks: values.negativeMarks,
                difficulty: values.difficulty,
                timeLimitInSeconds: values.timeLimitInSeconds,
                tags: values.tags,
                hints: values.hints,
                isActive: values.isActive,
            };
            // Clean up payload based on type before sending
            if (type === QuestionType.MCQ) {
                payload.mcqFields = {
                    options: values.options ?? [],
                    isMultiSelect: !!values.isMultiSelect,
                };
            }
            if (type === QuestionType.CODING) {
                payload.codingFields = {
                    programmingLanguages: values.programmingLanguages ?? [],
                    testCases: values.testCases ?? [],
                    constraints: values.constraints,
                    memoryLimitInMB: values.memoryLimitInMB,
                    starterCode: values.starterCode,
                    solutionCode: values.solutionCode,
                };
            }
            if (type === QuestionType.QUERY) {
                payload.queryFields = {
                    databaseType: values.databaseType!,
                    databaseSchema: values.databaseSchema,
                    sampleData: values.sampleData,
                    expectedQuery: values.expectedQuery!,
                    allowedKeywords: values.allowedKeywords,
                    forbiddenKeywords: values.forbiddenKeywords,
                };
            }
            if (type === QuestionType.SUBJECTIVE) {
                payload.subjectiveFields = {
                    minLength: values.minLength!,
                    maxLength: values.maxLength!,
                    expectedKeywords: values.expectedKeywords ?? [],
                    sampleAnswer: values.sampleAnswer,
                };
            }

            onSubmit(payload);
        }
    });

    // --- Dynamic List Handlers ---
    const updateDynamicList = (field: string, index: number, key: string, value: number | string | boolean) => {
        formik.setFieldValue(`${field}[${index}].${key}`, value);
    };

    const removeDynamicItem = (field: keyof FormQuestionInterface, index: number) => {
        const list = formik.values[field];
        if (Array.isArray(list)) {
            if (field === 'options' && list.length <= 2) {
                toast.error('At least 2 options are required');
                return;
            }
            formik.setFieldValue(field, list.filter((_, i) => i !== index));
        }
    };

    const handleOptionCorrectChange = (index: number, checked: boolean) => {
        const options = formik.values.options ?? [];
        if (formik.values.isMultiSelect) {
            updateDynamicList('options', index, 'isCorrect', checked);
        } else {
            const updated = options.map((opt, i) => ({
                ...opt,
                isCorrect: i === index ? checked : false,
            }));
            formik.setFieldValue('options', updated);
        }
    };

    const addOption = () => {
        formik.setFieldValue('options', [
            ...(formik.values.options || []),
            { text: '', isCorrect: false }
        ]);
    }

    const addTestCase = () => {
        formik.setFieldValue('testCases', [
            ...(formik.values.testCases || []),
            { input: '', expectedOutput: '', isPublic: false }
        ]);
    }

    return (
        <form id='question-form' onSubmit={formik.handleSubmit} className="space-y-3">
            {/* Base Question Details */}
            <ContentBox className="grid sm:grid-cols-2 gap-5">
                <FormSelect
                    id="type"
                    name="type"
                    label="Question Type"
                    options={Object.values(QuestionType).map(t => ({ label: t.toUpperCase(), value: t }))}
                    formik={formik}
                    required
                />
                <FormSelect
                    id="difficulty"
                    name="difficulty"
                    label="Difficulty Level"
                    options={Object.values(Difficulty).map(d => ({ label: d.toUpperCase(), value: d }))}
                    formik={formik}
                    required
                />
                <FormInput id="marks" name="marks" label="Marks" type="number" min={1} formik={formik} required />
                <FormInput id="negativeMarks" name="negativeMarks" label="Negative Marks" type="number" min={0} step={0.5} formik={formik} />
                <FormInput id="timeLimitInSeconds" name="timeLimitInSeconds" label="Time Limit (Seconds)" type="number" formik={formik} required />
                <FormSelect
                    id="isActive"
                    name="isActive"
                    label="Active"
                    options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                    formik={formik}
                />
            </ContentBox>

            <ContentBox className="space-y-5">
                <FormTextArea id="question" name="question" label="Question" rows={4} formik={formik} placeholder="Enter the question here..." required />
                <FormTextArea id="questionExplanation" name="questionExplanation" label="Question Explanation" rows={3} formik={formik} placeholder="Provide an explanation for the question" />
                <FormTextArea id="answerExplanation" name="answerExplanation" label="Answer Explanation" rows={3} formik={formik} placeholder="Provide an explanation for the correct answer (optional)" />
            </ContentBox>

            {/* Conditional Sections */}
            {/* --- CONDITIONAL: MCQ --- */}
            {formik.values.type === QuestionType.MCQ && (
                <ContentBox className='space-y-5'>
                    <h3 className="font-semibold text-text-main">MCQ Options</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <FormSelect
                            id="isMultiSelect"
                            name="isMultiSelect"
                            label="Is Multi Select?"
                            options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                            formik={formik}
                        />
                        <div className='flex items-end justify-end'>
                            <Button variant='secondary' className='px-2 py-1' onClick={addOption}>
                                <MdAdd className='text-xl' /> Add Option
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {formik.values.options && formik.values.options.length > 0 ? formik.values.options.map((option, index) => (
                            <div key={index + 1} className="flex flex-col gap-1 w-full relative">
                                <div className="flex items-center gap-3">
                                    <Input
                                        type={formik.values.isMultiSelect ? 'checkbox' : 'radio'}
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                            if (formik.values.isMultiSelect) {
                                                handleOptionCorrectChange(index, e.target.checked);
                                            }
                                        }}
                                        onClick={() => {
                                            if (!formik.values.isMultiSelect) {
                                                handleOptionCorrectChange(index, true);
                                            }
                                        }}
                                        className="cursor-pointer shrink-0"
                                        title="Mark as correct answer"
                                    />
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateDynamicList('options', index, 'text', e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className={Array.isArray(formik.errors.options) && (formik.errors.options as unknown as Record<string, string>[])[index]?.text ? 'border-error-main!' : ''}
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
                <ContentBox className='space-y-5'>
                    <h3 className="font-semibold text-text-main">Coding Environment Specs</h3>

                    <FormMultiClick
                        id="programmingLanguages"
                        name="programmingLanguages"
                        label="Allowed Languages"
                        options={Object.values(ProgrammingLanguage).map(lang => ({
                            label: lang.toUpperCase(),
                            value: lang
                        }))}
                        formik={formik}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput id="memoryLimitInMB" name="memoryLimitInMB" label="Memory Limit (MB)" type="number" formik={formik} />
                    </div>

                    <FormMultiInput
                        id="constraints"
                        name="constraints"
                        label="Constraints"
                        placeholder="Add a constraint and press Enter"
                        formik={formik}
                    />

                    <div>
                        <h4 className="font-semibold text-text-main mb-2">Test Cases</h4>
                        <div className="space-y-4">
                            {formik.values.testCases?.map((tc, index) => (
                                <div key={index + 1} className="space-y-3 border border-border-light p-3 rounded-md">
                                    <div className="flex justify-between">
                                        <label className="flex items-center text-sm gap-2 mt-2">
                                            <Input type="checkbox" checked={tc.isPublic} onChange={(e) => updateDynamicList('testCases', index, 'isPublic', e.target.checked)} />
                                            Public
                                        </label>
                                        <Button type="button" variant='icon' className='text-error-main' onClick={() => removeDynamicItem('testCases', index)}>
                                            <MdClose className="text-xl" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input type="text" placeholder="Input (e.g. '5 10')" value={tc.input} onChange={(e) => updateDynamicList('testCases', index, 'input', e.target.value)} />
                                        <Input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => updateDynamicList('testCases', index, 'expectedOutput', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant='text' onClick={addTestCase}>
                            <MdAdd /> Add Test Case
                        </Button>
                    </div>
                </ContentBox>
            )}

            {/* --- CONDITIONAL: QUERY --- */}
            {formik.values.type === QuestionType.QUERY && (
                <ContentBox className='space-y-5'>
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
                    <FormTextArea id="databaseSchema" name="databaseSchema" label="Database Schema (SQL setup script)" rows={4} formik={formik} placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));" />
                    <FormTextArea id="expectedQuery" name="expectedQuery" label="Expected Query (Correct Answer)" rows={3} formik={formik} placeholder="SELECT * FROM users WHERE age > 18;" required />
                    <FormTextArea id='sampleData' name='sampleData' label="Sample Data (SQL)" rows={4} formik={formik} placeholder="INSERT INTO users (id, name) VALUES (1, 'John Doe');" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormMultiInput
                            id="allowedKeywords"
                            name="allowedKeywords"
                            label="Allowed Keywords"
                            placeholder="Add a keyword and press Enter"
                            formik={formik}
                        />

                        <FormMultiInput
                            id="forbiddenKeywords"
                            name="forbiddenKeywords"
                            label="Forbidden Keywords"
                            placeholder="Add a keyword and press Enter"
                            formik={formik}
                        />
                    </div>
                </ContentBox>
            )}

            {/* --- CONDITIONAL: SUBJECTIVE --- */}
            {formik.values.type === QuestionType.SUBJECTIVE && (
                <ContentBox className='space-y-5'>
                    <h3 className="font-semibold text-text-main">Subjective Question Specs</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormInput id="minLength" name="minLength" label="Min Length" type="number" min={1} formik={formik} required />
                        <FormInput id="maxLength" name="maxLength" label="Max Length" type="number" min={1} formik={formik} required />
                    </div>
                    <FormMultiInput
                        id="expectedKeywords"
                        name="expectedKeywords"
                        label="Expected Keywords (In Candidate's Answer)"
                        placeholder="Enter keywords"
                        formik={formik}
                        required
                    />
                    <FormTextArea id="sampleAnswer" name="sampleAnswer" label="Sample Answer" rows={3} formik={formik} placeholder="Provide an sample answer (optional)" />
                </ContentBox>
            )}

            {/* --- TAGS & HINTS --- */}
            <ContentBox className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags */}
                <FormMultiInput
                    id="tags"
                    name="tags"
                    label="Tags"
                    placeholder="Add a tag and press Enter"
                    formik={formik}
                    required
                />

                {/* Hints */}
                <FormMultiInput
                    id="hints"
                    name="hints"
                    label="Hints"
                    placeholder="Add a hint and press Enter"
                    formik={formik}
                />
            </ContentBox>

            <PageFooter>
                <Button variant="outline" onClick={handleCancel} type="button">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    form='question-form'
                    loading={isLoading}
                    loadingText={isEditMode ? "Updating..." : "Creating..."}
                    disabled={!formik.dirty || formik.isSubmitting}
                >
                    {isEditMode ? "Update Question" : "Create Question"}
                </Button>
            </PageFooter>
        </form>
    );
};

export default QuestionForm;
