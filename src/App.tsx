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
import AppLayout from './layouts/AppLayout';
import { getHomePath } from './utils/roleUtils';
import { useAuth } from './hooks/useAuth';
import { lazy, Suspense } from 'react';
import PageLoader from './components/common/PageLoader';
import RoleGuard from './components/common/RoleGuard';
import { UserRole } from './types/authTypes';

const Home = lazy(() => import('./pages/public/Home'));
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
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getHomePath(user.role)} replace />;
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
                <Route path="/" element={<Home />} />
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>

                <Route path="/redirect" element={<RootRedirect />} />

                {/* User Routes */}
                <Route element={<AppLayout />}>
                  <Route element={<RoleGuard allowedRoles={[UserRole.USER]} />}>
                    {/* <Route index element={<Dashboard />} /> */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="assessments" element={<Assessments />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="assessments/:id" element={<AssessmentDetails />} />
                    <Route path="assessments/:id/take" element={<TakeAssessment />} />
                  </Route>

                  {/* App Routes */}
                  <Route path='/app'>
                    <Route element={<RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR]} />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="assessments" element={<AdminAssessments />} />
                      <Route path="questions" element={<AdminQuestions />} />
                    </Route>

                    <Route element={<RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]} />}>
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="assessments/create" element={<CreateAssessment />} />
                      <Route path="assessments/:id/edit" element={<EditAssessment />} />
                      <Route path="questions/create" element={<CreateQuestion />} />
                      <Route path="questions/:id/edit" element={<EditQuestion />} />
                    </Route>
                  </Route>
                </Route>

                {/* Not Found Route */}
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
