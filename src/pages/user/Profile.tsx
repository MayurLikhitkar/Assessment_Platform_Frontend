import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Alert,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    Edit,
    Save,
    Cancel,
    Person,
    Security,
    History,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/axios/api';
import type { UserInterface } from '../../types/types';
import { getProfile } from '../../services/axios/authApi';

const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
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
    const [editMode, setEditMode] = useState(false);

    // Fetch user profile data
    const { data: profileData, refetch } = useQuery({
        queryKey: ['userProfile', user?.id],
        queryFn: () => getProfile(),
        enabled: !!user,
    });

    // Update profile mutation
    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserInterface>) => api.put('/auth/profile', data),
        onSuccess: (data) => {
            updateUser(data);
            toast.success('Profile updated successfully');
            setEditMode(false);
            refetch();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => api.put('/auth/change-password', data),
        onSuccess: () => {
            toast.success('Password changed successfully');
            passwordFormik.resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to change password');
        },
    });

    // Profile form
    const profileFormik = useFormik<Partial<UserInterface>>({
        initialValues: {
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            skills: user?.skills || [],
            experience: user?.experience || 0,
            requireWebcam: user?.requireWebcam ?? true,
            requireMicrophone: user?.requireMicrophone ?? true,
        },
        validationSchema: ProfileSchema,
        onSubmit: (values) => {
            updateMutation.mutate(values);
        },
        enableReinitialize: true,
    });

    // Password form
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: PasswordSchema,
        onSubmit: (values) => {
            changePasswordMutation.mutate(values);
        },
    });

    // Handle skills input
    const handleSkillsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const skills = event.target.value.split(',').map(s => s.trim()).filter(s => s);
        profileFormik.setFieldValue('skills', skills);
    };

    if (!user) {
        return (
            <Box className="flex justify-center py-8">
                <LinearProgress className="w-64" />
            </Box>
        );
    }

    return (
        <Box className="space-y-6">
            {/* Header */}
            <Box className="flex justify-between items-center">
                <Typography variant="h4" className="font-bold">
                    Profile Settings
                </Typography>
                {!editMode && activeTab === 0 && (
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Profile Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent className="text-center">
                            {/* Profile Image */}
                            <Box className="relative inline-block mb-4">
                                <Avatar
                                    src={user.profilePicture}
                                    className="w-32 h-32 text-4xl"
                                >
                                    {user.fullName}
                                </Avatar>
                            </Box>

                            <Typography variant="h5" className="font-bold">
                                {user.fullName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" className="mb-2">
                                {user.email}
                            </Typography>

                            <Chip
                                label={user.role.toUpperCase()}
                                color="primary"
                                size="small"
                                className="mb-4"
                            />

                            <Divider className="my-4" />

                            {/* Account Stats */}
                            <Box className="space-y-3 text-left">
                                <Box className="flex justify-between">
                                    <Typography variant="body2" color="textSecondary">
                                        Member Since:
                                    </Typography>
                                    <Typography variant="body2" className="font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>

                                <Box className="flex justify-between">
                                    <Typography variant="body2" color="textSecondary">
                                        Last Login:
                                    </Typography>
                                    <Typography variant="body2" className="font-medium">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                    </Typography>
                                </Box>

                                <Box className="flex justify-between">
                                    <Typography variant="body2" color="textSecondary">
                                        Account Status:
                                    </Typography>
                                    <Chip
                                        label={user.status.toUpperCase()}
                                        size="small"
                                        color={user.status === 'active' ? 'success' : 'error'}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Proctoring Settings Card */}
                    <Card className="mt-4">
                        <CardContent>
                            <Typography variant="h6" className="font-bold mb-3">
                                <Security className="mr-2" />
                                Proctoring Settings
                            </Typography>

                            <Box className="space-y-3">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={profileFormik.values.requireWebcam}
                                            onChange={profileFormik.handleChange}
                                            name="requireWebcam"
                                            disabled={!editMode}
                                        />
                                    }
                                    label="Require Webcam"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={profileFormik.values.requireMicrophone}
                                            onChange={profileFormik.handleChange}
                                            name="requireMicrophone"
                                            disabled={!editMode}
                                        />
                                    }
                                    label="Require Microphone"
                                />

                                <Typography variant="caption" color="textSecondary">
                                    These settings apply to all your assessments unless overridden by specific assessment settings.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Forms */}
                <Grid size={{ xs: 12, md: 8 }} >
                    <Card>
                        <CardContent>
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                                <Tab label="Personal Info" icon={<Person />} />
                                <Tab label="Security" icon={<Security />} />
                                <Tab label="Assessment History" icon={<History />} />
                            </Tabs>

                            {/* Personal Info Tab */}
                            {activeTab === 0 && (
                                <Box className="mt-6">
                                    <form onSubmit={profileFormik.handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12, md: 6 }} >
                                                <TextField
                                                    fullWidth
                                                    label="Full Name"
                                                    name="fullName"
                                                    value={profileFormik.values.fullName}
                                                    onChange={profileFormik.handleChange}
                                                    onBlur={profileFormik.handleBlur}
                                                    error={profileFormik.touched.fullName && Boolean(profileFormik.errors.fullName)}
                                                    helperText={profileFormik.touched.fullName && profileFormik.errors.fullName}
                                                    disabled={!editMode}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }} >
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    value={profileFormik.values.email}
                                                    onChange={profileFormik.handleChange}
                                                    onBlur={profileFormik.handleBlur}
                                                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                                                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                                                    disabled={!editMode}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Phone"
                                                    name="phone"
                                                    value={profileFormik.values.phone}
                                                    onChange={profileFormik.handleChange}
                                                    onBlur={profileFormik.handleBlur}
                                                    error={profileFormik.touched.phone && Boolean(profileFormik.errors.phone)}
                                                    helperText={profileFormik.touched.phone && profileFormik.errors.phone}
                                                    disabled={!editMode}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Skills (comma separated)"
                                                    name="skills"
                                                    value={profileFormik.values.skills.join(', ')}
                                                    onChange={handleSkillsChange}
                                                    onBlur={profileFormik.handleBlur}
                                                    disabled={!editMode}
                                                    helperText="e.g., JavaScript, React, Node.js"
                                                />
                                                <Box className="flex flex-wrap gap-1 mt-2">
                                                    {profileFormik.values.skills.map((skill, index) => (
                                                        <Chip key={index} label={skill} size="small" />
                                                    ))}
                                                </Box>
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Experience (years)"
                                                    name="experience"
                                                    type="number"
                                                    value={profileFormik.values.experience}
                                                    onChange={profileFormik.handleChange}
                                                    onBlur={profileFormik.handleBlur}
                                                    error={profileFormik.touched.experience && Boolean(profileFormik.errors.experience)}
                                                    helperText={profileFormik.touched.experience && profileFormik.errors.experience}
                                                    disabled={!editMode}
                                                />
                                            </Grid>
                                        </Grid>

                                        {editMode && (
                                            <Box className="flex justify-end space-x-2 mt-6">
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<Cancel />}
                                                    onClick={() => {
                                                        setEditMode(false);
                                                        profileFormik.resetForm();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    startIcon={<Save />}
                                                    disabled={profileFormik.isSubmitting || updateMutation.isPending}
                                                >
                                                    {profileFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </Box>
                                        )}
                                    </form>
                                </Box>
                            )}

                            {/* Security Tab */}
                            {activeTab === 1 && (
                                <Box className="mt-6">
                                    <form onSubmit={passwordFormik.handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <Alert severity="info" className="mb-4">
                                                    Change your password to keep your account secure.
                                                </Alert>
                                            </Grid>

                                            <Grid size={{ xs: 12, }}>
                                                <TextField
                                                    fullWidth
                                                    label="Current Password"
                                                    name="currentPassword"
                                                    type="password"
                                                    value={passwordFormik.values.currentPassword}
                                                    onChange={passwordFormik.handleChange}
                                                    onBlur={passwordFormik.handleBlur}
                                                    error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                                                    helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="New Password"
                                                    name="newPassword"
                                                    type="password"
                                                    value={passwordFormik.values.newPassword}
                                                    onChange={passwordFormik.handleChange}
                                                    onBlur={passwordFormik.handleBlur}
                                                    error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                                                    helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Confirm New Password"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={passwordFormik.values.confirmPassword}
                                                    onChange={passwordFormik.handleChange}
                                                    onBlur={passwordFormik.handleBlur}
                                                    error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                                                    helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                                                />
                                            </Grid>

                                            <Grid size={{ xs: 12, }}>
                                                <Box className="flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        disabled={passwordFormik.isSubmitting || changePasswordMutation.isPending}
                                                    >
                                                        {passwordFormik.isSubmitting ? 'Changing...' : 'Change Password'}
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </form>

                                    <Divider className="my-6" />

                                    {/* Security Settings */}
                                    <Typography variant="h6" className="font-bold mb-4">
                                        Security Settings
                                    </Typography>

                                    <Box className="space-y-3">
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => {
                                                // TODO: Implement two-factor authentication
                                                toast('Two-factor authentication coming soon');
                                            }}
                                        >
                                            Enable Two-Factor Authentication
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to logout from all devices?')) {
                                                    // TODO: Implement logout all devices
                                                    toast('Logout from all devices feature coming soon');
                                                }
                                            }}
                                        >
                                            Logout from All Devices
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* Assessment History Tab */}
                            {activeTab === 2 && (
                                <Box className="mt-6">
                                    <Typography variant="body1" className="mb-4">
                                        Your assessment history and performance analytics will appear here.
                                    </Typography>
                                    {/* TODO: Implement assessment history table */}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;