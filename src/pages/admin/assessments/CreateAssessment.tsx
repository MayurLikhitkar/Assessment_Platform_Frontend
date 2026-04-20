import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import BackButton from '../../../components/common/BackButton';
import { Page, PageBody, PageHeader } from '../../../components/ui/Page';
import AssessmentForm from '../../../components/forms/AssessmentForm';

import { createAssessment } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import { AssessmentDifficulty, type AssessmentInterface } from '../../../types/assessmentTypes';

const CreateAssessment: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createAssessment,
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Assessment created successfully!');
                queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
                navigate('/admin/assessments');
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to create assessment');
        },
    });

    const initialValues: Partial<AssessmentInterface> = {
        title: '',
        description: '',
        type: [],
        difficulty: AssessmentDifficulty.BEGINNER,
        durationInMinutes: 60,
        totalMarks: 100,
        passingMarks: 50,
    };

    return (
        <Page>
            <PageHeader>
                <BackButton variant='outline' />
                <h1 className="text-2xl font-bold text-text-main">Create Assessment</h1>
            </PageHeader>

            <PageBody>
                <AssessmentForm
                    initialValues={initialValues}
                    onSubmit={(values) => mutation.mutate(values)}
                    handleCancel={() => navigate(-1)}
                    isLoading={mutation.isPending}
                    isEditMode={false}
                />
            </PageBody>
        </Page>
    );
};

export default CreateAssessment;
