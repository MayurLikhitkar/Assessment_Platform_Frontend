import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email')
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
        <div className="w-full max-w-md">
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Welcome Back
                    </CardTitle>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <FormInput
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                formik={formik}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={formik.isSubmitting}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Candidate Assessment Platform</p>
            </div>
        </div>
    );
};

export default Login;