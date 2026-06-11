import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { TOASTER_PROPS } from './config/config';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './services/queryClient';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { getHomePath } from './utils/roleUtils';
import { useAuth } from './hooks/useAuth';
import { lazy, Suspense } from 'react';
import PageLoader from './components/common/PageLoader';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

const Assessments = lazy(() => import('./pages/user/assessments/Assessments'));
const Profile = lazy(() => import('./pages/user/profile/Profile'));
const Dashboard = lazy(() => import('./pages/user/dashboard/Dashboard'));
const TakeAssessment = lazy(() => import('./pages/user/assessments/TakeAssessment'));
const AssessmentDetails = lazy(() => import('./pages/user/assessments/AssessmentDetails'));


const AdminDashboard = lazy(() => import('./pages/admin/dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/users/AdminUsers'));
const AdminAssessments = lazy(() => import('./pages/admin/assessments/AdminAssessments'));
const CreateAssessment = lazy(() => import('./pages/admin/assessments/CreateAssessment'));
const AdminQuestions = lazy(() => import('./pages/admin/questions/AdminQuestions'));
const CreateQuestion = lazy(() => import('./pages/admin/questions/CreateQuestion'));
const EditAssessment = lazy(() => import('./pages/admin/assessments/EditAssessment'));
const EditQuestion = lazy(() => import('./pages/admin/questions/EditQuestion'));
const AdminProfile = lazy(() => import('./pages/admin/profile/AdminProfile'));

// Add a root redirect component to handle role-based routing
const RootRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user?.role)} replace />;
};

function App() {
  console.info("Welcome to Assessment Platform");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster {...TOASTER_PROPS} />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* User Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/assessments" element={<Assessments />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/assessment/:id" element={<AssessmentDetails />} />
                  <Route path="/assessment/:id/take" element={<TakeAssessment />} />
                  {/*
              <Route path="/assessments/:id" element={<AssessmentDetail />} /> */}
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/assessments" element={<AdminAssessments />} />
                  <Route path="/admin/assessments/create" element={<CreateAssessment />} />
                  <Route path="/admin/assessments/edit/:id" element={<EditAssessment />} />
                  <Route path="/admin/questions" element={<AdminQuestions />} />
                  <Route path="/admin/questions/create" element={<CreateQuestion />} />
                  <Route path="/admin/questions/edit/:id" element={<EditQuestion />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LocalizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
