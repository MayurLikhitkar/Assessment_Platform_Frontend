import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdAdd } from 'react-icons/md';

import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import FormTextArea from '../ui/FormTextArea';
import FormMultiClick from '../ui/FormMultiClick';
import Button from '../ui/Button';
import { ContentBox } from '../ui/Page';
import AddQuestionsModal from '../modal/AddQuestionsModal';

import { type AssessmentInterface } from '../../types/assessmentTypes';

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
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);

    const formik = useFormik<Partial<AssessmentInterface>>({
        initialValues,
        enableReinitialize: true,
        validationSchema: assessmentSchema,
        onSubmit: async (values) => {
            const payload = {
                ...values,
                // questions: initialValues.questions?.map(q => q._id).filter(Boolean) as string[],
            };
            onSubmit(payload);
        },
    });

    const handleAddQuestions = (selectedQuestions: string[]) => {
        // Filter duplicates just in case
        const existingQuestions = formik.values.questions ?? [];
        const existingIds = new Set(existingQuestions);
        const newQuestions = selectedQuestions.filter(q => !existingIds.has(q));
        formik.setFieldValue('questions', [...existingQuestions, ...newQuestions]);
    };

    return (
        <>
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Col: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <ContentBox>
                        <form id="assessment-form" onSubmit={formik.handleSubmit} className="space-y-4">
                            <FormInput id="title" name="title" label="Title" type="text" formik={formik} required />
                            <FormTextArea id="description" name="description" label="Description" rows={3} formik={formik} required />

                            {/* Assessment Type - multi-select chips */}
                            <FormMultiClick
                                id="type"
                                name="type"
                                label="Type"
                                options={typeOptions}
                                formik={formik}
                                required
                            />

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
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput id="durationInMinutes" name="durationInMinutes" label="Duration (min)" type="number" formik={formik} required />
                                <FormInput id="totalMarks" name="totalMarks" label="Total Marks" type="number" formik={formik} required />
                                <FormInput id="passingMarks" name="passingMarks" label="Passing Marks" type="number" formik={formik} required />
                            </div>
                        </form>
                    </ContentBox>

                    <ContentBox>
                        <h2 className="text-lg font-semibold text-text-dark mb-4 border-b border-border-light/50 pb-2">
                            Proctoring Settings
                        </h2>
                        <p className="text-sm text-text-light">Advanced proctoring options will go here.</p>
                    </ContentBox>
                </div>

                {/* Right Col: Questions */}
                <div className="lg:col-span-2">
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-border-light/50 pb-2">
                            <h2 className="text-lg font-semibold text-text-dark">Questions</h2>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => setIsAddQuestionsModalOpen(true)}
                            >
                                <MdAdd /> Add Questions
                            </Button>
                        </div>

                        {(formik.values.questions?.length || 0) < 1 ? (
                            <div className="text-center py-12 bg-muted-light/20 rounded-lg border border-dashed border-border-light">
                                <p className="text-text-main font-medium">No questions added yet</p>
                                <p className="text-sm text-text-light mt-1">Click "Add Questions" to select from question bank.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* {questions.map((q, idx) => (
                                    <div key={q._id} className="flex justify-between items-center bg-background-main border border-border-light rounded-lg p-3">
                                        <div className="flex-1 mr-4">
                                            <div className="flex items-start">
                                                <span className="font-semibold text-text-dark text-sm mr-2 mt-0.5">{idx + 1}.</span>
                                                <div>
                                                    <span className="text-sm text-text-main line-clamp-2">{q.question}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] bg-muted-light/80 text-text-light px-2 py-0.5 rounded-full uppercase font-bold">{q.type}</span>
                                                        <span className="text-[10px] bg-secondary-light/20 text-secondary-dark px-2 py-0.5 rounded-full font-bold">{q.marks} Marks</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="p-1.5 text-error-main hover:bg-error-light/20 rounded-lg transition-colors shrink-0"
                                            onClick={() => setQuestions(prev => prev.filter(pq => pq._id !== q._id))}
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                ))} */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-border-light/50 pt-5">
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
            </div>

            <AddQuestionsModal
                isOpen={isAddQuestionsModalOpen}
                onClose={() => setIsAddQuestionsModalOpen(false)}
                onAddSelected={handleAddQuestions}
                existingQuestionIds={initialValues.questions || []}
            />
        </>
    );
};

export default AssessmentForm;
