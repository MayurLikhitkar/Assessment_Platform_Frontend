import React from 'react';
import Modal from '../../../components/ui/Modal';
import FormInput from '../../../components/ui/FormInput';
import FormSelect from '../../../components/ui/FormSelect';
import Button from '../../../components/ui/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import type { ApiResponse, UserInterface } from '../../../types/types';
import { createUser } from '../../../services/axios/adminApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateUserModalProps {
    isCreateModalOpen: boolean;
    setIsCreateModalOpen: (open: boolean) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<UserInterface> & { password?: string }) => createUser(data),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage || 'User created successfully');
                queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
                setIsCreateModalOpen(false);
                formik.resetForm();
            }
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to create user');
        },
    });

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            role: 'user',
            phone: '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Full Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
            role: Yup.string().required('Role is required'),
            phone: Yup.string(),
        }),
        onSubmit: (values) => {
            createMutation.mutate(values as Partial<UserInterface> & { password?: string });
        },
    });

    return (
        <Modal
            isOpen={isCreateModalOpen}
            onClose={() => {
                setIsCreateModalOpen(false);
                formik.resetForm();
            }}
            title="Create New User"
            maxWidth="lg"
        >
            <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                <FormInput
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    formik={formik}
                    required
                />
                <FormInput
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john.doe@example.com"
                    formik={formik}
                    required
                />
                <FormInput
                    id="password"
                    name="password"
                    label="Temporary Password"
                    type="password"
                    placeholder="••••••••"
                    formik={formik}
                    required
                />
                <FormSelect
                    id="role"
                    name="role"
                    label="Assign Role"
                    placeholder="Select a role"
                    formik={formik}
                    options={[
                        { label: 'User (Candidate)', value: 'user' },
                        { label: 'Proctor', value: 'proctor' },
                        { label: 'Evaluator', value: 'evaluator' },
                        { label: 'Admin', value: 'admin' },
                    ]}
                    required
                />
                <FormInput
                    id="phone"
                    name="phone"
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    formik={formik}
                />

                <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-border-light/50">
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => {
                            setIsCreateModalOpen(false);
                            formik.resetForm();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={createMutation.isPending}
                    >
                        Create User
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateUserModal;