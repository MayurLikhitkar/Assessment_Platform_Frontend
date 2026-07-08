import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import BackButton from '../../../components/common/BackButton';
import { Page, PageBody, PageHeader } from '../../../components/ui/Page';
import AssessmentForm from '../../../components/forms/AssessmentForm';

import { getAssessmentById, updateAssessment } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { AssessmentInterface, FormAssessmentInterface } from '../../../types/assessmentTypes';
import DataLoader from '../../../components/common/DataLoader';

const EditAssessment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!id) {
            toast.error('Assessment ID is required');
            navigate(-1);
        }
    }, [id, navigate]);

    const { data: response, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessmentById(id as string),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<AssessmentInterface>) => updateAssessment({ id: id as string, data }),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Assessment updated successfully!');
                queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
                queryClient.invalidateQueries({ queryKey: ['assessment', id] });
                navigate('/app/assessments');
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to update assessment');
        },
    });

    const assessment = response?.data;

    const initialValues: Partial<FormAssessmentInterface> = {
        title: assessment?.title,
        description: assessment?.description,
        type: assessment?.type,
        difficulty: assessment?.difficulty,
        durationInMinutes: assessment?.durationInMinutes,
        totalMarks: assessment?.totalMarks,
        passingMarks: assessment?.passingMarks,
        negativeMarking: assessment?.negativeMarking,
        maxAttempts: assessment?.maxAttempts,
        startDate: assessment?.startDate,
        endDate: assessment?.endDate,
        tags: assessment?.tags,
        instructions: assessment?.instructions,
        questions: assessment?.questions,
        requireWebcam: assessment?.webcam.allowed,
        requireMicrophone: assessment?.microphone.allowed,
        enableRecording: assessment?.enableRecording,
        allowTabSwitch: assessment?.tabSwitch.allowed,
        maxTabSwitches: assessment?.tabSwitch.max,
        allowFullscreenExit: assessment?.fullscreenExit.allowed,
        maxFullscreenExits: assessment?.fullscreenExit.max,
        isActive: assessment?.isActive,
        isPublic: assessment?.isPublic,
    };

    return (
        <Page>
            <PageHeader>
                <BackButton variant='outline' />
                <h1 className="text-2xl font-bold text-text-main">Edit Assessment</h1>
            </PageHeader>

            <PageBody>
                {isLoading ? (
                    <DataLoader />
                ) : response?.data ? (
                    <AssessmentForm
                        initialValues={initialValues}
                        onSubmit={(values) => updateMutation.mutate(values)}
                        handleCancel={() => navigate(-1)}
                        isLoading={updateMutation.isPending}
                        isEditMode={true}
                    />
                ) : (
                    <div className="flex justify-center py-10 text-error-main">Assessment not found</div>
                )}
            </PageBody>
        </Page>
    );
};

export default EditAssessment;
