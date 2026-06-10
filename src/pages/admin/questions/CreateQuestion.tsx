import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { createQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import { QuestionType, Difficulty, ProgrammingLanguage, DatabaseType, type QuestionInterface } from '../../../types/questionTypes';

import BackButton from '../../../components/common/BackButton';
import { Page, PageBody, PageHeader } from '../../../components/ui/Page';
import QuestionForm from '../../../components/forms/QuestionForm';

const CreateQuestion: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createQuestion,
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Question created successfully');
                queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
                navigate(-1);
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to create question');
        },
    });

    const initialValues: Partial<QuestionInterface> = {
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
        timeLimitInSeconds: 30,
        memoryLimitInMB: 256,
        testCases: [],
        constraints: [],
        allowedLanguages: [ProgrammingLanguage.JAVASCRIPT],
        databaseType: DatabaseType.POSTGRESQL,
        expectedKeywords: [],
    };

    return (
        <Page>
            <PageHeader>
                <BackButton variant='outline' />
                <div>
                    <h1 className="text-2xl font-semibold text-text-main">Create Question</h1>
                    <p className="text-sm text-text-light">Fill in the details to create a new question</p>
                </div>
            </PageHeader>

            <PageBody>
                <QuestionForm
                    initialValues={initialValues}
                    onSubmit={(values) => createMutation.mutate(values)}
                    handleCancel={() => navigate(-1)}
                    isLoading={createMutation.isPending}
                    isEditMode={false}
                />
            </PageBody>
        </Page>
    );
};

export default CreateQuestion;