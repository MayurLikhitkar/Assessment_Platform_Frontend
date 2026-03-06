import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import { MdMenu } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import type { ApiResponse } from '../../types/types';

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .max(254, 'Email address is too long')
        .required('Email is required'),
    password: Yup.string()
        .max(128, 'Password must be at most 128 characters')
        .required('Password is required'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await login(values);
                navigate('/dashboard');
                toast.success('Login successful!');
            } catch (error) {
                const apiError = error as ApiResponse<null>;
                toast.error(apiError.responseMessage || 'Login failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex-col lg:flex-row flex">
            {/* LEFT SIDE: Branding & Context (Hidden on mobile) */}
            <div className="flex w-full lg:w-1/2 bg-background-inverse relative overflow-hidden flex-col justify-between p-8 sm:p-12 text-text-inverse">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-main rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-main rounded-full blur-3xl"></div>
                </div>
                <div>
                    {/* Logo */}
                    <div className="relative z-10 flex items-center gap-2 mb-10">
                        <span className="w-10 h-10 bg-primary-main/70 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold border border-background-light/30">
                            A
                        </span>
                        <span className="text-2xl font-bold tracking-tight">AssessPro</span>
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-lg space-y-6">
                        <h1 className="text-2xl font-semibold sm:text-4xl leading-tight font-rubik">
                            Evaluate talent with <span className="text-primary-main">precision</span> and <span className="text-secondary-main">confidence</span>.
                        </h1>
                        <p className="text-text-inverse/90 sm:text-lg">
                            Join thousands of organizations using our platform to streamline technical assessments and identify top candidates faster.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-4 text-text-inverse/90">
                            <div className="flex items-center gap-3">
                                <MdMenu className="w-5 h-5" />
                                <span className="">AI-Powered Proctoring</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MdMenu className="w-5 h-5" />
                                <span className="">Deep Performance Analytics</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MdMenu className="w-5 h-5" />
                                <span className="">Enterprise-Grade Security</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer/Copyright */}
                <div className="lg:block hidden relative z-10 text-sm text-text-inverse/60">
                    © {new Date().getFullYear()} AssessPro Platform. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-background-main text-text-main">
                <div className="max-w-md sm:p-8 p-6 rounded-2xl shadow-xl border border-border-light bg-background-light">

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Welcome Back</h2>
                        <p className="mt-2 text-sm">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <FormInput
                            id="email"
                            name="email"
                            label="Work Email"
                            type="email"
                            placeholder="abc@xyz.com"
                            required
                            formik={formik}
                        />
                        <div>
                            <FormInput
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                required
                                placeholder="••••••••"
                                formik={formik}
                            />
                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold tracking-wide text-secondary-dark"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full"
                                loading={formik.isSubmitting}
                                variant="primary"
                                size="md"
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border-main text-center">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-primary-dark hover:text-primary-main font-semibold"
                        >
                            Create an account
                        </Link>
                    </div>
                </div>
                {/* Footer/Copyright */}
                <div className="lg:hidden relative z-10 text-sm text-text-light mt-15">
                    © {new Date().getFullYear()} AssessPro Platform. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;