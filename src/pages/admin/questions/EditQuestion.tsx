import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

import { getQuestionById, updateQuestion } from '../../../services/axios/adminApi';
import type { ApiResponse } from '../../../types/types';
import type { QuestionInterface } from '../../../types/questionTypes';

import BackButton from '../../../components/common/BackButton';
import { Page, PageBody, PageHeader } from '../../../components/ui/Page';
import QuestionForm from '../../../components/forms/QuestionForm';
import DataLoader from '../../../components/common/DataLoader';

const EditQuestion: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!id) {
            toast.error('Question ID is required');
            navigate(-1);
        }
    }, [id, navigate]);

    const { data: response, isLoading: isFetching } = useQuery({
        queryKey: ['question', id],
        queryFn: () => getQuestionById(id as string),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<QuestionInterface>) => updateQuestion({ id: id as string, data }),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'Question updated successfully!');
                queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
                queryClient.invalidateQueries({ queryKey: ['question', id] });
                navigate('/admin/questions');
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to update question');
        },
    });

    return (
        <Page>
            <PageHeader>
                <BackButton variant='outline' />
                <h1 className="text-2xl font-bold text-text-main">Edit Question</h1>
            </PageHeader>

            <PageBody>
                {isFetching ? (
                    <DataLoader />
                ) : response?.data ? (
                    <QuestionForm
                        initialValues={response.data}
                        onSubmit={(values) => updateMutation.mutate(values)}
                        handleCancel={() => navigate(-1)}
                        isLoading={updateMutation.isPending}
                        isEditMode={true}
                    />
                ) : (
                    <div className="flex justify-center py-10 text-error-main">Question not found</div>
                )}
            </PageBody>
        </Page>
    );
};

export default EditQuestion;
