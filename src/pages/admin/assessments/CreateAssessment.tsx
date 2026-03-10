import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdClose } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import FormInput from '../../../components/ui/FormInput';
import FormSelect from '../../../components/ui/FormSelect';
import FormTextArea from '../../../components/ui/FormTextArea';
import Button from '../../../components/ui/Button';
import AddQuestionsModal from '../../../components/modal/AddQuestionsModal';
import type { Question } from '../../../types/types';

// Validation Schema
const assessmentSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    difficulty: Yup.string().required('Required'),
    duration: Yup.number().min(5, 'Minimum 5 mins').required('Required'),
    totalMarks: Yup.number().min(1).required('Required'),
    passingMarks: Yup.number().min(1).required('Required'),
});

const CreateAssessment: React.FC = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);

    const handleAddQuestions = (selectedQuestions: Question[]) => {
        setQuestions(prev => [...prev, ...selectedQuestions]);
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            difficulty: 'beginner',
            duration: 60,
            totalMarks: 100,
            passingMarks: 50,
        },
        validationSchema: assessmentSchema,
        onSubmit: async (values) => {
            try {
                // Here we would call the actual API POST /assessments
                console.log('Submitting assessment:', { ...values, questions });
                toast.success('Assessment created safely! (Mock)');
                navigate('/admin/assessments');
            } catch (error) {
                console.error(error);
                toast.error('Failed to create assessment');
            }
        },
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/assessments')}
                    className="p-2 hover:bg-muted-light rounded-full text-text-light hover:text-text-dark transition-colors"
                >
                    <MdArrowBack className="text-xl" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">Create Assessment</h1>
                    <p className="text-text-light mt-1">Configure details and add questions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6">
                        <h2 className="text-lg font-semibold text-text-dark mb-4 border-b border-border-light/50 pb-2">
                            Basic Details
                        </h2>
                        <form id="assessment-form" onSubmit={formik.handleSubmit} className="space-y-4">
                            <FormInput id="title" name="title" label="Title" type="text" formik={formik} required />
                            <FormTextArea id="description" name="description" label="Description" rows={3} formik={formik} required />
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
                                <FormInput id="duration" name="duration" label="Duration (min)" type="number" formik={formik} required />
                                <FormInput id="totalMarks" name="totalMarks" label="Total Marks" type="number" formik={formik} required />
                                <FormInput id="passingMarks" name="passingMarks" label="Passing Marks" type="number" formik={formik} required />
                            </div>
                        </form>
                    </div>

                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6">
                        <h2 className="text-lg font-semibold text-text-dark mb-4 border-b border-border-light/50 pb-2">
                            Proctoring Settings
                        </h2>
                        {/* Placeholder for proctoring toggles */}
                        <p className="text-sm text-text-light">Advanced proctoring options will go here.</p>
                    </div>
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
                                onClick={() => { toast("Add Questions modal to be implemented", { icon: '🚧' }) }}
                            >
                                <MdAdd /> Add Questions
                            </Button>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-12 bg-muted-light/20 rounded-lg border border-dashed border-border-light">
                                <p className="text-text-main font-medium">No questions added yet</p>
                                <p className="text-sm text-text-light mt-1">Click "Add Questions" to select from question bank.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((q, idx) => (
                                    <div key={q.questionId} className="flex justify-between items-center bg-background-main border border-border-light rounded-lg p-3">
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
                                            onClick={() => setQuestions(prev => prev.filter(pq => pq.questionId !== q.questionId))}
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light border-t border-border-main shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3 lg:pl-64">
                <Button type="button" variant="outline" size="md" onClick={() => navigate('/admin/assessments')}>
                    Cancel
                </Button>
                <Button type="submit" form="assessment-form" variant="primary" size="md">
                    Create Assessment
                </Button>
            </div>

            <AddQuestionsModal
                isOpen={isAddQuestionsModalOpen}
                onClose={() => setIsAddQuestionsModalOpen(false)}
                onAddSelected={handleAddQuestions}
                existingQuestionIds={questions.map(q => q.questionId)}
            />
        </div>
    );
};

export default CreateAssessment;
