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
import Button from '../ui/Button';
import { ContentBox, PageFooter } from '../ui/Page';
import { getQuestions } from '../../services/axios/adminApi';
import type { QuestionInterface } from '../../types/questionTypes';
import { type AssessmentInterface } from '../../types/assessmentTypes';
import AgGridTable from '../common/AgGridTable';

// Validation Schema
const assessmentSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    type: Yup.array()
        .of(Yup.string().oneOf(['aptitude', 'coding', 'query', 'subjective', 'mcq']))
        .min(1, 'Select at least one type')
        .required('Type is required'),
    difficulty: Yup.string().required('Required'),
    durationInMinutes: Yup.number().min(10, 'Minimum 10 mins').max(240, 'Maximum 240 mins').required('Required'),
    totalMarks: Yup.number().min(1).required('Required'),
    passingMarks: Yup.number().min(1).required('Required'),
});

const typeOptions = [
    { label: 'Aptitude', value: 'aptitude' },
    { label: 'MCQ', value: 'mcq' },
    { label: 'Coding', value: 'coding' },
    { label: 'Query', value: 'query' },
    { label: 'Subjective', value: 'subjective' },
];

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
    isEditMode = false
}) => {
    const [isAddingQuestions, setIsAddingQuestions] = useState(false);
    const [selectedQns, setSelectedQns] = useState<Set<string>>(new Set());

    const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
        queryKey: ['adminQuestions'],
        queryFn: getQuestions,
    });

    const allQuestions: QuestionInterface[] = questionsData?.data || [];

    const formik = useFormik<Partial<AssessmentInterface>>({
        initialValues,
        enableReinitialize: true,
        validationSchema: assessmentSchema,
        onSubmit: async (values) => {
            const payload = {
                ...values,
            };
            onSubmit(payload);
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
            headerName: '',
            maxWidth: 50,
            filter: false,
            sortable: false,
        },
        {
            headerName: 'Question',
            field: 'question',
            minWidth: 250,
            flex: 3,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                return (
                    <div>
                        <p className="text-sm font-medium text-text-dark line-clamp-2">{params.data.question}</p>
                        <div className="flex gap-1 mt-1">
                            {params.data.tags?.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[10px] bg-muted-light/60 text-text-light px-1.5 py-0.5 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 100,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<QuestionInterface>) => {
                if (!params.data) return null;
                const type = params.data.type;
                return (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-muted-light/80 text-text-light`}>
                        {type}
                    </span>
                );
            },
        },
        {
            headerName: 'Marks',
            field: 'marks',
            minWidth: 80,
            flex: 0.5,
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
                    options={typeOptions}
                    formik={formik}
                    required
                />
                <div className="grid grid-cols-2 gap-5">
                    <FormSelect
                        id="difficulty"
                        name="difficulty"
                        label="Difficulty"
                        options={[
                            { label: 'Beginner', value: 'beginner' },
                            { label: 'Intermediate', value: 'intermediate' },
                            { label: 'Advanced', value: 'advanced' },
                            { label: 'Expert', value: 'expert' },
                        ]}
                        formik={formik}
                        placeholder="Select difficulty"
                        required
                    />
                    <FormInput id="durationInMinutes" name="durationInMinutes" label="Duration (In Min)" type="number" formik={formik} required />
                    <FormInput id="totalMarks" name="totalMarks" label="Maximum Marks" type="number" formik={formik} required />
                    <FormInput id="passingMarks" name="passingMarks" label="Minimum Passing Marks" type="number" formik={formik} required />
                </div>
            </ContentBox>

            <ContentBox>
                <h2 className="text-lg font-semibold text-text-dark mb-4 border-b border-border-light/50 pb-2">
                    Proctoring Settings
                </h2>
                <p className="text-sm text-text-light">Advanced proctoring options will go here.</p>
            </ContentBox>

            <ContentBox className='space-y-6'>
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-text-dark">Assessment Questions</h2>
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
                    <div className="space-y-4 border border-border-light rounded-lg p-4 bg-background-main">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium text-text-dark">Select Questions from Bank</h3>
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
                            rowData={filteredQuestions}
                            columnDefs={columnDefs}
                            onSelectionChanged={onSelectionChanged}
                            rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }}
                            loading={isLoadingQuestions}
                            hasExport={false}
                            getRowId={(params) => params.data._id}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-main">
                                {selectedQns.size} Question(s) selected
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
                            <div className="text-center py-12 bg-muted-light rounded-lg border border-dashed border-border-light">
                                <p className="text-text-main font-medium">No questions added yet</p>
                                <p className="text-sm text-text-light mt-1">Click "Add Questions" to select from question bank.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedQuestionsObjects.map((q, idx) => (
                                    <div key={q._id} className="flex justify-between items-center bg-background-main border border-border-light rounded-lg p-3">
                                        <div className="flex-1 mr-4">
                                            <div className="flex items-start">
                                                <span className="font-semibold text-text-dark text-sm mr-2 mt-0.5">{idx + 1}.</span>
                                                <div>
                                                    <span className="text-sm text-text-main line-clamp-2">{q.question}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-muted-light/80 text-text-light`}>{q.type}</span>
                                                        <span className="text-[10px] bg-secondary-light/20 text-secondary-dark px-2 py-0.5 rounded-full font-bold">{q.marks} Marks</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-1.5 text-error-main hover:bg-error-light/20 rounded-lg transition-colors shrink-0"
                                            onClick={() => handleRemoveQuestion(q._id)}
                                        >
                                            <MdClose />
                                        </button>
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
                >
                    {isEditMode ? "Update Assessment" : "Create Assessment"}
                </Button>
            </PageFooter>


        </form>
    );
};

export default AssessmentForm;
