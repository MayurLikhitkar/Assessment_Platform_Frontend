import React, { useState, useMemo, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdAdd, MdClose } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import type { ColDef, ICellRendererParams, SelectionChangedEvent } from 'ag-grid-community';

import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormTextArea from '../ui/FormTextArea';
import FormMultiClick from '../ui/FormMultiClick';
import FormDatePicker from '../ui/FormDatePicker';
import FormMultiInput from '../ui/FormMultiInput';
import Button from '../ui/Button';
import { ContentBox, PageFooter } from '../ui/Page';
import { getQuestions } from '../../services/axios/adminApi';
import type { Difficulty, QuestionInterface } from '../../types/questionTypes';
import { AssessmentDifficulty, AssessmentType, type AssessmentInterface } from '../../types/assessmentTypes';
import AgGridTable from '../common/AgGridTable';

interface AssessmentFormProps {
    initialValues: Partial<AssessmentInterface>;
    onSubmit: (values: Partial<AssessmentInterface>) => void;
    handleCancel: () => void;
    isLoading: boolean;
    isEditMode?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
    initialValues,
    onSubmit,
    handleCancel,
    isLoading,
    isEditMode
}) => {
    const [isAddingQuestions, setIsAddingQuestions] = useState(false);
    const [selectedQns, setSelectedQns] = useState<Set<string>>(new Set());

    const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const allQuestions: QuestionInterface[] = questionsData?.data || [];

    // Validation Schema
    const assessmentSchema = Yup.object({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
        type: Yup.array()
            .of(Yup.string().oneOf(['aptitude', 'coding', 'query', 'subjective', 'mcq']))
            .min(1, 'Select at least one type')
            .required('Type is required'),
        difficulty: Yup.string().required('Difficulty is required'),
        durationInMinutes: Yup.number().min(10, 'Minimum 10 mins').max(240, 'Maximum 240 mins').required('Duration is required'),
        totalMarks: Yup.number().min(1).required('Total marks is required'),
        passingMarks: Yup.number().min(1).required('Passing marks is required'),
        startDate: Yup.date()
            .nullable()
            .test('start-date-min', 'Start date cannot be in the past', function (value) {
                if (isEditMode) return true;
                if (!value) return true;
                return value >= new Date(new Date().setHours(0, 0, 0, 0));
            }),
        endDate: Yup.date()
            .nullable()
            .when('startDate', (startDate: Date[], schema) => {
                return startDate?.[0]
                    ? schema.min(startDate[0], 'End date must be after Start date')
                    : schema;
            }),
        tags: Yup.array().of(Yup.string()).min(1, 'Add at least one tag').required('Required'),
        instructions: Yup.string(),
        isActive: Yup.boolean(),
        isPublic: Yup.boolean(),
        requireWebcam: Yup.boolean(),
        requireMicrophone: Yup.boolean(),
        allowTabSwitch: Yup.boolean(),
        maxTabSwitches: Yup.number().when('allowTabSwitch', {
            is: true,
            then: (schema) => schema.min(1, 'Minimum 1').required('Required'),
            otherwise: (schema) => schema.notRequired()
        }),
        allowFullscreenExit: Yup.boolean(),
        maxFullscreenExits: Yup.number().when('allowFullscreenExit', {
            is: true,
            then: (schema) => schema.min(1, 'Minimum 1').required('Required'),
            otherwise: (schema) => schema.notRequired()
        }),
        enableRecording: Yup.boolean()
    });

    const formik = useFormik<Partial<AssessmentInterface>>({
        initialValues,
        enableReinitialize: true,
        validationSchema: assessmentSchema,
        onSubmit: async (values) => {
            // console.info(values)
            onSubmit(values);
        },
    });

    const existingQuestionIds = formik.values.questions || [];
    const availableQuestions = allQuestions.filter(q => !existingQuestionIds.includes(q._id));
    const filteredQuestions = availableQuestions;

    const onSelectionChanged = useCallback((event: SelectionChangedEvent<QuestionInterface>) => {
        const selectedRows = event.api.getSelectedRows();
        const ids = selectedRows.map(row => row._id);
        setSelectedQns(new Set(ids));
    }, []);

    const handleConfirmAdd = () => {
        const existing = formik.values.questions || [];
        formik.setFieldValue('questions', [...existing, ...Array.from(selectedQns)]);
        setSelectedQns(new Set());
        setIsAddingQuestions(false);
    };

    const handleRemoveQuestion = (id: string) => {
        const existing = formik.values.questions || [];
        formik.setFieldValue('questions', existing.filter(qId => qId !== id));
    };

    const columnDefs = useMemo<ColDef<QuestionInterface>[]>(() => [
        {
            headerName: 'Question',
            field: 'question',
            minWidth: 150,
            flex: 1,
            cellClass: 'font-semibold text-text-main',
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Difficulty',
            field: 'difficulty',
            minWidth: 130,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
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
            headerName: 'Type',
            field: 'type',
            minWidth: 100,
            cellClass: "uppercase text-xs font-semibold",
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const type = params.data.type;
                return type;
            },
        },
        {
            headerName: 'Marks',
            field: 'marks',
            minWidth: 100,
            cellClass: "font-bold text-secondary-main",
        },
    ], []);

    const selectedQuestionsObjects = allQuestions.filter(q => existingQuestionIds.includes(q._id));

    return (
        <form id="assessment-form" onSubmit={formik.handleSubmit} className="space-y-3">
            <ContentBox className="space-y-5">
                <FormInput id="title" name="title" label="Title of Assessment" type="text" formik={formik} required />
                <FormTextArea id="description" name="description" label="Description" rows={3} formik={formik} required />

                <FormMultiClick
                    id="type"
                    name="type"
                    label="Assessment Type"
                    options={Object.values(AssessmentType).map(t => ({ label: t.replaceAll(/\b\w/g, c => c.toUpperCase()), value: t }))}
                    formik={formik}
                    required
                />
                <div className="grid grid-cols-2 gap-5">
                    <FormSelect
                        id="difficulty"
                        name="difficulty"
                        label="Difficulty"
                        options={Object.values(AssessmentDifficulty).map(t => ({ label: t.replaceAll(/\b\w/g, c => c.toUpperCase()), value: t }))}
                        formik={formik}
                        placeholder="Select difficulty"
                        required
                    />
                    <FormInput id="durationInMinutes" name="durationInMinutes" label="Duration (In Min)" type="number" formik={formik} required />
                    <FormInput id="totalMarks" name="totalMarks" label="Maximum Marks" type="number" formik={formik} required />
                    <FormInput id="passingMarks" name="passingMarks" label="Minimum Passing Marks" type="number" formik={formik} required />
                </div>
            </ContentBox>

            <ContentBox className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <FormSelect
                        id="isActive"
                        name="isActive"
                        label="Active"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    <FormSelect
                        id="isPublic"
                        name="isPublic"
                        label="Public"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    <FormDatePicker withTime id="startDate" name="startDate" label="Start Date" formik={formik} />
                    <FormDatePicker withTime id="endDate" name="endDate" label="End Date" formik={formik} />
                </div>
                <FormMultiInput id="tags" name="tags" label="Tags" formik={formik} placeholder="Type and press enter" required />

                <FormTextArea id="instructions" name="instructions" label="Instructions" rows={4} formik={formik} />

            </ContentBox>

            <ContentBox>
                <h2 className="text-lg font-semibold text-text-main mb-4 border-b border-border-light/50 pb-2">
                    Proctoring Settings
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <FormSelect
                        id="requireWebcam"
                        name="requireWebcam"
                        label="Require Webcam"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    <FormSelect
                        id="requireMicrophone"
                        name="requireMicrophone"
                        label="Require Microphone"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    <FormSelect
                        id="enableRecording"
                        name="enableRecording"
                        label="Enable Recording"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    <FormSelect
                        id="allowTabSwitch"
                        name="allowTabSwitch"
                        label="Allow Tab Switch"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    {formik.values.allowTabSwitch && (
                        <FormInput id="maxTabSwitches" name="maxTabSwitches" label="Max Tab Switches" type="number" formik={formik} required />
                    )}
                    <FormSelect
                        id="allowFullscreenExit"
                        name="allowFullscreenExit"
                        label="Allow Fullscreen Exit"
                        options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                        formik={formik}
                    />
                    {formik.values.allowFullscreenExit && (
                        <FormInput id="maxFullscreenExits" name="maxFullscreenExits" label="Max Fullscreen Exits" type="number" formik={formik} required />
                    )}
                </div>
            </ContentBox>

            <ContentBox className='space-y-6'>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-text-main">Assessment Questions</h2>
                    {!isAddingQuestions && (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setIsAddingQuestions(true)}
                        >
                            <MdAdd /> Add Questions
                        </Button>
                    )}
                </div>

                {isAddingQuestions ? (
                    <div className="space-y-4 border border-border-light bg-background-main rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-text-main">Select Questions from Bank</h3>
                            <Button
                                type="button"
                                onClick={() => setIsAddingQuestions(false)}
                                variant="icon"
                                className="border! border-secondary-light/50! "
                                aria-label="Close modal"
                            >
                                <MdClose className="text-xl" />
                            </Button>
                        </div>

                        <AgGridTable<QuestionInterface>
                            rowData={filteredQuestions.filter(q => q.isActive)}
                            columnDefs={columnDefs}
                            onSelectionChanged={onSelectionChanged}
                            rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }}
                            loading={isLoadingQuestions}
                            hasExport={false}
                            getRowId={(params) => params.data._id}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-main">
                                Question(s) Selected : <span className="text-secondary-main text-lg">{selectedQns.size}</span>
                            </p>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddingQuestions(false)}>Cancel</Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    disabled={selectedQns.size === 0}
                                    onClick={handleConfirmAdd}
                                    className="flex items-center gap-1"
                                >
                                    <MdAdd /> Add Selected
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {(existingQuestionIds.length) < 1 ? (
                            <div className="text-center py-12 bg-background-dark rounded-lg outline-dashed outline-2 outline-muted-dark outline-offset-2">
                                <p className="text-text-main font-medium">No questions added yet</p>
                                <p className="text-sm text-text-light mt-1">Click "Add Questions" to select from Question Bank.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedQuestionsObjects.map((q, idx) => (
                                    <div key={q._id} className="flex justify-between items-center bg-background-main border border-border-light rounded-lg p-3">
                                        <div className="flex-1 flex items-start gap-3">
                                            <span className="font-semibold text-secondary-dark text-sm">{idx + 1}.</span>
                                            <div>
                                                <span className="text-sm font-semibold text-text-main line-clamp-2">{q.question}</span>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs bg-secondary-light/20 text-secondary-dark px-2 py-0.5 rounded font-bold">{q.marks} Marks</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold bg-background-light text-text-light border border-border-light`}>{q.type}</span>
                                                    <span className="text-xs bg-primary-light/10 text-primary-main px-2 py-0.5 rounded font-bold capitalize border border-border-light">{q.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant='outline'
                                            onClick={() => handleRemoveQuestion(q._id)}
                                        >
                                            <MdClose />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </ContentBox>

            <PageFooter>
                <Button variant="outline" onClick={handleCancel} type="button">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="assessment-form"
                    variant="primary"
                    loading={isLoading}
                    loadingText={isEditMode ? "Updating..." : "Creating..."}
                    disabled={!formik.dirty || formik.isSubmitting}
                >
                    {isEditMode ? "Update Assessment" : "Create Assessment"}
                </Button>
            </PageFooter>
        </form>
    );
};

export default AssessmentForm;
