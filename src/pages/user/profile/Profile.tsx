import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MdPerson, MdSecurity, MdHistory, MdCancel, MdEdit, MdSave } from 'react-icons/md';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import type { ApiError, UserInterface } from '../../../types/types';
import { changePassword, getProfile, updateProfile } from '../../../services/axios/authApi';
import Button from '../../../components/ui/Button';
import FormInput from '../../../components/ui/FormInput';
import Input from '../../../components/ui/Input';
import DataLoader from '../../../components/common/DataLoader';
import type { ChangePasswordRequest } from '../../../types/authTypes';
import TabButton from '../../../components/ui/TabButton';
import Confirmation from '../../../components/modal/Confirmation';
import { BsFillPatchQuestionFill } from "react-icons/bs";
import InfoField from '../../../components/ui/InfoField';
import Label from '../../../components/ui/Label';

const ProfileSchema = Yup.object().shape({
    fullName: Yup.string()
        .required('You fullname is required')
        .min(2, 'your full name must be at least 2 characters'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    skills: Yup.array().of(Yup.string()),
    experience: Yup.number().min(0, 'Experience cannot be negative'),
});

const PasswordSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [editMode, setEditMode] = useState(true);
    const [newSkill, setNewSkill] = useState('');
    const [modal, setModal] = useState(false);

    // Fetch user profile data
    const { data: profileData, refetch } = useQuery({
        queryKey: ['userProfile', user?.id],
        queryFn: () => getProfile(),
        enabled: !!user,
    });

    // Update profile mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserInterface>) => updateProfile(data),
        onSuccess: (data) => {
            if (data?.success) {
                updateUser(data.data);
                toast.success(data.responseMessage);
                setEditMode(false);
                refetch();
            }
        },
        onError: (error: ApiError) => {
            toast.error(error.responseMessage || 'Failed to update profile');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordRequest) => changePassword(data),
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data.responseMessage);
                passwordFormik.resetForm();
            }
        },
        onError: (error: ApiError) => {
            toast.error(error.responseMessage || 'Failed to change password');
        },
    });

    // Profile form
    const profileFormik = useFormik<Partial<UserInterface>>({
        initialValues: {
            fullName: profileData?.data.fullName || '',
            email: profileData?.data.email || '',
            phone: profileData?.data.phone || '',
            skills: profileData?.data.skills || [],
            experience: profileData?.data.experience || 0,
            requireWebcam: profileData?.data.requireWebcam ?? true,
            requireMicrophone: profileData?.data.requireMicrophone ?? true,
        },
        validationSchema: ProfileSchema,
        onSubmit: async (values) => {
            try {
                await updateMutation.mutateAsync(values);
            } catch (error) {
                console.error('Error updating profile:', error);
            }
        },
        enableReinitialize: true,
    });

    // Password form
    const passwordFormik = useFormik<ChangePasswordRequest>({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: PasswordSchema,
        onSubmit: async (values) => {
            try {
                await changePasswordMutation.mutateAsync(values);
            } catch (error) {
                console.error('Error changing password:', error);
            }
        },
    });

    // Handle skills input
    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();
        if (trimmedSkill && !profileFormik.values.skills?.includes(trimmedSkill)) {
            profileFormik.setFieldValue('skills', [...(profileFormik.values.skills || []), trimmedSkill]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        profileFormik.setFieldValue(
            'skills',
            profileFormik.values.skills?.filter((skill) => skill !== skillToRemove)
        );
    };

    const handleNewSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddSkill();
        }
    };

    if (!profileData) {
        return (
            <DataLoader />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-dark">
                    Profile Settings
                </h1>
                {!editMode && activeTab === 0 && (
                    <Button variant='outline' className='text-primary-main border-primary-light'
                        onClick={() => setEditMode(true)}
                    >
                        <MdEdit />
                        Edit
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column - Profile Info */}
                <div className="md:col-span-4 space-y-4">
                    <div className="bg-background-light rounded-lg shadow-md p-6 text-center">
                        <h2 className="text-xl font-bold text-text-dark">
                            {profileData.data.fullName}
                        </h2>
                        <p className="text-text-light mb-2">
                            {profileData.data.email}
                        </p>

                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-main text-white mb-4">
                            {profileData.data.role.toUpperCase()}
                        </span>

                        <hr className="my-4 border-border-light" />

                        {/* Account Stats */}
                        <div className="space-y-3 text-left">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-light">
                                    Member Since:
                                </span>
                                <span className="font-medium text-text-dark">
                                    {new Date(profileData.data.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-text-light">
                                    Last Login:
                                </span>
                                <span className="font-medium text-text-dark">
                                    {profileData.data.lastLogin ? new Date(profileData.data.lastLogin).toLocaleString() : 'Never'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm items-center">
                                <span className="text-text-light">
                                    Account Status:
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${profileData.data.status === 'active' ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'
                                        }`}
                                >
                                    {profileData.data.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Proctoring Settings Card */}
                    <div className="bg-background-light rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
                            <MdSecurity className="text-lg" />
                            Proctoring Settings
                        </h3>

                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-text-dark">Require Webcam</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        name="requireWebcam"
                                        checked={profileFormik.values.requireWebcam}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-main"></div>
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-text-dark">Require Microphone</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        name="requireMicrophone"
                                        checked={profileFormik.values.requireMicrophone}
                                        onChange={profileFormik.handleChange}
                                        disabled={!editMode}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-main"></div>
                                </div>
                            </label>

                            <p className="text-xs text-text-light mt-2">
                                These settings apply to all your assessments unless overridden by specific assessment settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="md:col-span-8">
                    <div className="bg-background-light rounded-lg shadow-md p-6">
                        {/* Tabs */}
                        <div className="flex space-x-4">
                            <TabButton
                                label="Personal Info"
                                icon={<MdPerson className="text-lg" />}
                                isActive={activeTab === 0}
                                onClick={() => setActiveTab(0)}
                            />
                            <TabButton
                                label="Security"
                                icon={<MdSecurity className="text-lg" />}
                                isActive={activeTab === 1}
                                onClick={() => setActiveTab(1)}
                            />
                            <TabButton
                                label="Assessment History"
                                icon={<MdHistory className="text-lg" />}
                                isActive={activeTab === 2}
                                onClick={() => setActiveTab(2)}
                            />
                        </div>

                        {/* Personal Info Tab */}
                        {activeTab === 0 && (
                            <div className="mt-6">
                                <form onSubmit={profileFormik.handleSubmit}>
                                    {editMode ?
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormInput
                                                id="fullName"
                                                name="fullName"
                                                label="Full Name"
                                                type="text"
                                                placeholder="John Doe"
                                                formik={profileFormik}
                                                disabled={!editMode}
                                            />

                                            <FormInput
                                                id="email"
                                                name="email"
                                                label="Work Email"
                                                type="email"
                                                placeholder="john.doe@company.com"
                                                formik={profileFormik}
                                                disabled={!editMode}
                                            />

                                            <FormInput
                                                id="phone"
                                                name="phone"
                                                label="Phone Number"
                                                type="tel"
                                                placeholder="123-456-7890"
                                                formik={profileFormik}
                                                disabled={!editMode}
                                            />

                                            <FormInput
                                                id="experience"
                                                name="experience"
                                                label="Experience (years)"
                                                type="number"
                                                placeholder="1"
                                                inputMode='text'
                                                formik={profileFormik}
                                                disabled={!editMode}
                                            />

                                            <div className="flex flex-col gap-1 md:col-span-2">
                                                <label
                                                    htmlFor="newSkillInput"
                                                    className="mb-2 block text-base font-medium text-text-main"
                                                >
                                                    Skills
                                                </label>
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        id="newSkillInput"
                                                        name="newSkillInput"
                                                        type="text"
                                                        placeholder="Add a skill and press Enter or click Add"
                                                        value={newSkill}
                                                        onChange={(e) => setNewSkill(e.target.value)}
                                                        onKeyDown={handleNewSkillKeyDown}
                                                        disabled={!editMode}
                                                        className="grow"
                                                    />
                                                    {editMode && (
                                                        <Button
                                                            type="button"
                                                            onClick={handleAddSkill}
                                                            variant="primary"
                                                            size="md"
                                                            disabled={!newSkill.trim()}
                                                        >
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {profileFormik.values.skills && profileFormik.values.skills.length > 0 && profileFormik.values.skills.map((skill, index) => (
                                                        <span key={index + 1} className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium border border-primary-light/50 text-text-dark">
                                                            <MdCancel className="cursor-pointer text-error-dark text-base hover:text-error-main" onClick={() => handleRemoveSkill(skill)} />
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div> :
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoField
                                                label="Full Name"
                                                value={profileData.data.fullName}
                                            />

                                            <InfoField
                                                label="Work Email"
                                                value={profileData.data.email}
                                            />

                                            <InfoField
                                                label="Phone Number"
                                                value={profileData.data.phone || 'N/A'}
                                            />

                                            <InfoField
                                                label="Experience (years)"
                                                value={profileData.data.experience || 'N/A'}
                                            />

                                            <div className="mb-2">
                                                <Label label='Skills' />
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {profileData.data.skills && profileData.data.skills.length > 0 && profileData.data.skills.map((skill, index) => (
                                                        <span key={index + 1} className="px-2 rounded-md font-medium bg-primary-main border border-primary-light/50 text-text-inverse">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {editMode && (
                                        <div className="flex justify-end space-x-2 mt-6">
                                            <Button
                                                variant='outline'
                                                onClick={() => {
                                                    setEditMode(false);
                                                    profileFormik.resetForm();
                                                }}
                                            >
                                                <MdCancel className='text-error-main group-hover:text-error-dark text-lg' />
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={profileFormik.isSubmitting || !profileFormik.dirty || updateMutation.isPending}
                                            >
                                                <MdSave />
                                                {profileFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 1 && (
                            <div className="mt-6">
                                <form onSubmit={passwordFormik.handleSubmit}>
                                    <div className="space-y-6">
                                        <FormInput
                                            id="currentPassword"
                                            name="currentPassword"
                                            label="Current Password"
                                            type="password"
                                            placeholder="*********"
                                            formik={passwordFormik}
                                        />
                                        <FormInput
                                            id="newPassword"
                                            name="newPassword"
                                            label="New Password"
                                            type="password"
                                            placeholder="*********"
                                            formik={passwordFormik}
                                        />
                                        <FormInput
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            label="Current Password"
                                            type="password"
                                            placeholder="*********"
                                            formik={passwordFormik}
                                        />

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={passwordFormik.isSubmitting || !passwordFormik.dirty || changePasswordMutation.isPending}
                                            >
                                                <MdSave />
                                                {passwordFormik.isSubmitting ? 'Changing...' : 'Change Password'}
                                            </Button>
                                        </div>
                                    </div>
                                </form>

                                <hr className="my-6 border-primary-light" />

                                {/* Security Settings */}
                                <h3 className="text-lg font-bold text-text-dark mb-4">
                                    Security Settings
                                </h3>

                                <div className="flex gap-3">
                                    <Button
                                        variant='secondary'
                                        // onClick={() => toast('Two-factor authentication coming soon')}
                                        onClick={() => setModal(true)}
                                    >
                                        Enable Two-Factor Authentication
                                    </Button>
                                    <Button
                                        variant='danger'
                                        onClick={() => toast.success('Logged out successfully')}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Assessment History Tab */}
                        {activeTab === 2 && (
                            <div className="mt-6">
                                <p className="text-text-dark mb-4">
                                    Your assessment history and performance analytics will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Confirmation
                open={modal}
                onClose={() => setModal(false)}
                icon={BsFillPatchQuestionFill}
                message='Are you sure you want to enable Two-Factor Authentication? This will add an extra layer of security to your account by requiring a verification code in addition to your password.'
                onConfirm={() => { setModal(false); toast.success('2FA Setup initiated'); }}
            />
        </div>
    );
};

export default Profile;