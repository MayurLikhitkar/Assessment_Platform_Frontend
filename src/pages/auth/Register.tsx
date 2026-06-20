import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import { FaUsers, FaShieldAlt, FaAward } from "react-icons/fa";
import { MdOutlineTrendingUp } from "react-icons/md";
import type { ApiResponse } from '../../types/types';
import { GoDot, GoDotFill } from "react-icons/go";

const registerSchema = Yup.object().shape({
    fullName: Yup.string()
        .required('Full name is required')
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must be at most 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/, 'Full name contains invalid characters'),
    email: Yup.string()
        .email('Invalid email address')
        .max(254, 'Email address is too long')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be at most 128 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/\d/, 'Password must contain at least one number'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    phone: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
        .optional(),
});

const features = [
    {
        icon: FaAward, // Represents achievement or quality
        stat: '98%',
        title: "Candidate Satisfaction",
    },
    {
        icon: MdOutlineTrendingUp, // Represents growth or improvement
        stat: '75%',
        title: "Reduction in Hiring Time",
    },
    {
        icon: FaShieldAlt, // Represents security
        stat: '100%',
        title: "Secure & Private",
    },
    {
        icon: FaUsers, // Represents collaboration or scale
        stat: '100+',
        title: "Enterprise Clients",
    },
]

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
        validationSchema: registerSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                await register(values);
                toast.success('Account created successfully!');
                navigate('/login');
            } catch (error) {
                const apiError = error as ApiResponse<null>;
                toast.error(apiError.responseMessage || 'Registration failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    const getPasswordStrength = (password: string) => {
        let score = 0;
        if (!password) return 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        return score;
    };

    const strength = getPasswordStrength(formik.values.password);

    const getStrengthColor = (score: number) => {
        if (score <= 2) return 'bg-error-main';
        if (score <= 4) return 'bg-warn-main';
        return 'bg-success-main';
    };

    const getStrengthTextColor = (score: number) => {
        if (score <= 2) return 'text-error-main';
        if (score <= 4) return 'text-warn-main';
        return 'text-success-main';
    };

    return (
        <div className="min-h-screen flex-col lg:flex-row flex">
            {/* LEFT SIDE: Branding & Benefits (Hidden on mobile) */}
            <div className="w-full lg:w-1/2 bg-background-inverse relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-text-inverse">
                {/* Abstract Background Pattern */}
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
                        <span className="text-2xl font-bold tracking-tight">AssessHub</span>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10 max-w-lg space-y-10">
                        <h1 className="text-2xl font-semibold sm:text-4xl leading-tight font-rubik">
                            Start your journey to <br /><span className="text-secondary-light">Smarter Hiring</span>
                        </h1>
                        <p className="text-text-inverse/80 sm:text-lg">
                            Join leading companies who trust AssessHub to identify and evaluate top talent through data-driven assessments.
                        </p>

                        {/* Benefits Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-10">
                            {features.map(feature => (
                                <div key={feature.stat} className="flex gap-4">
                                    <div className="p-3 bg-background-main backdrop-blur-sm rounded-lg flex items-center justify-center border border-background-light/20">
                                        <feature.icon className="w-8 h-8 text-secondary-dark" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-2xl">{feature.stat}</h3>
                                        <p className="text-sm text-text-inverse/80">{feature.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer/Copyright */}
                <div className="lg:block hidden relative z-10 text-sm text-text-inverse/60">
                    © {new Date().getFullYear()} AssessHub Platform. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE: Registration Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-background-main text-text-main">
                <div className="max-w-md sm:p-8 p-6 rounded-2xl shadow-xl border border-border-light bg-background-light">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">Create Your Account</h2>
                        <p className="mt-2 text-sm">
                            Start evaluating candidates in minutes
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                            label="Work Email"
                            type="email"
                            placeholder="john.doe@company.com"
                            formik={formik}
                            required
                        />

                        <FormInput
                            id="phone"
                            name="phone"
                            label="Phone Number"
                            type="tel"
                            placeholder="123-456-7890"
                            formik={formik}
                        />

                        <FormInput
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            formik={formik}
                            required
                        />

                        <FormInput
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            formik={formik}
                            required
                        />

                        {/* Password Strength & Requirements */}
                        <div className="space-y-3">
                            {/* Strength Meter */}
                            {formik.values.password && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-text-light">Password Strength</span>
                                        <span className={`font-medium ${getStrengthTextColor(strength)}`}>
                                            {strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-background-main rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                            style={{ width: `${(strength / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="bg-accent-light/10 border border-secondary-main/20 rounded-lg p-3">
                                <p className="text-xs text-secondary-dark font-medium mb-1">Password must contain:</p>
                                <ul className="text-xs text-text-main space-y-0.5">
                                    <li className={`flex items-center gap-2 ${formik.values.password.length >= 8 ? 'text-success-main' : 'text-text-light'}`}>
                                        <span className="">{formik.values.password.length >= 8 ? <GoDotFill /> : <GoDot />}</span> At least 8 characters
                                    </li>
                                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(formik.values.password) ? 'text-success-main' : 'text-text-light'}`}>
                                        <span className="">{/[A-Z]/.test(formik.values.password) ? <GoDotFill /> : <GoDot />}</span> One uppercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${/[a-z]/.test(formik.values.password) ? 'text-success-main' : 'text-text-light'}`}>
                                        <span className="">{/[a-z]/.test(formik.values.password) ? <GoDotFill /> : <GoDot />}</span> One lowercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${/\d/.test(formik.values.password) ? 'text-success-main' : 'text-text-light'}`}>
                                        <span className="">{/\d/.test(formik.values.password) ? <GoDotFill /> : <GoDot />}</span> One number
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full shadow-lg shadow-primary-main/20 py-2.5"
                                loading={formik.isSubmitting}
                                variant="primary"
                                size="md"
                            >
                                Create Account
                            </Button>
                        </div>

                        {/* Terms & Privacy */}
                        <p className="text-xs text-center text-text-light pt-2">
                            By signing up, you agree to our{' '}
                            <Link to="/terms" className="text-primary-dark hover:text-primary-main font-medium transition-colors">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary-dark hover:text-primary-main font-medium transition-colors">
                                Privacy Policy
                            </Link>
                        </p>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border-main text-center">
                        <p className="text-sm text-text-light">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-dark hover:text-primary-main font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>

                </div>
                {/* Footer/Copyright */}
                <div className="lg:hidden relative z-10 text-sm text-text-light mt-15">
                    © {new Date().getFullYear()} AssessHub Platform. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Register;