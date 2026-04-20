import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import BackButton from '../../../components/common/BackButton';
import { Page, PageBody, PageHeader } from '../../../components/ui/Page';
import AssessmentForm from '../../../components/forms/AssessmentForm';

import { getAssessmentById, updateAssessment } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { AssessmentInterface } from '../../../types/assessmentTypes';

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

    const { data: response, isLoading: isFetching } = useQuery({
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
                navigate('/admin/assessments');
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to update assessment');
        },
    });

    return (
        <Page>
            <PageHeader>
                <BackButton variant='outline' />
                <h1 className="text-2xl font-bold text-text-main">Edit Assessment</h1>
            </PageHeader>

            <PageBody>
                {isFetching ? (
                    <div className="flex justify-center py-10 text-text-light">Loading...</div>
                ) : !response?.data ? (
                    <div className="flex justify-center py-10 text-error-main">Assessment not found</div>
                ) : (
                    <AssessmentForm
                        initialValues={response.data}
                        onSubmit={(values) => updateMutation.mutate(values)}
                        handleCancel={() => navigate(-1)}
                        isLoading={updateMutation.isPending}
                        isEditMode={true}
                    />
                )}
            </PageBody>
        </Page>
    );
};

export default EditAssessment;
