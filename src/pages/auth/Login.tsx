import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import { Menu } from '@mui/icons-material';
// import { CheckCircle2, BarChart3, ShieldCheck } from 'lucide-react'; // Assuming you can install lucide-react, or use icons of your choice

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    // const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // await login(values.email, values.password);

                // Simulating network delay for UI demo
                await new Promise(resolve => setTimeout(resolve, 1000));

                toast.success('Logged in successfully!');
                navigate('/dashboard');
            } catch (error) {
                toast.error(String(error) || 'Login failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* LEFT SIDE: Branding & Context (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
                </div>

                {/* Logo Area */}
                <div className="relative z-10 flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-white">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight">AssessPro</span>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Evaluate talent with <span className="text-primary-400">precision</span> and <span className="text-secondary-400">confidence</span>.
                    </h1>
                    <p className="text-slate-300 text-lg mb-8">
                        Join thousands of organizations using our platform to streamline technical assessments and identify top candidates faster.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Menu className="text-primary-400 w-5 h-5" />
                            <span className="text-slate-200">AI-Powered Proctoring</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Menu className="text-primary-400 w-5 h-5" />
                            <span className="text-slate-200">Deep Performance Analytics</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Menu className="text-primary-400 w-5 h-5" />
                            <span className="text-slate-200">Enterprise-Grade Security</span>
                        </div>
                    </div>
                </div>

                {/* Footer/Copyright */}
                <div className="relative z-10 text-sm text-slate-500">
                    © {new Date().getFullYear()} AssessPro Platform. All rights reserved.
                </div>
            </div>

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold text-white">
                            A
                        </div>
                        <span className="text-xl font-bold text-slate-900">AssessPro</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <FormInput
                                id="email"
                                name="email"
                                label="Work Email" // "Work Email" sounds more professional
                                type="email"
                                placeholder="name@company.com"
                                formik={formik}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <FormInput
                                id="password"
                                name="password"
                                label="password"
                                // Label handled above for custom layout
                                type="password"
                                placeholder="••••••••"
                                formik={formik}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full shadow-lg shadow-primary-500/20 py-2.5"
                                loading={formik.isSubmitting}
                                variant="primary"
                                size="md"
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;