import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';

const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
});

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const { confirmPassword, ...registerData } = values;
                await register(registerData);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Registration failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="w-full max-w-md">
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Create Account
                    </CardTitle>
                    <p className="text-gray-600 mt-2">Get started with your free account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <FormInput
                                id="fullName"
                                name="fullName"
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                formik={formik}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <FormInput
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                formik={formik}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                id="phone"
                                name="phone"
                                label="Phone"
                                type="tel"
                                placeholder="Enter your phone number"
                                formik={formik}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                formik={formik}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                formik={formik}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={formik.isSubmitting}
                        >
                            Create Account
                        </Button>

                        <div className="mt-4">
                            <p className="text-xs text-gray-500">
                                By creating an account, you agree to our{' '}
                                <Link to="/terms" className="text-primary-600 hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;