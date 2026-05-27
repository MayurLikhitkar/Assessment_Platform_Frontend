import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AuthLayout from './layouts/AuthLayout';
import Register from './pages/auth/Register';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { TOASTER_PROPS } from './utils/config';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './services/queryClient';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import MainLayout from './layouts/MainLayout';
import Assessments from './pages/user/assessments/Assessments';
import Profile from './pages/user/profile/Profile';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminAssessments from './pages/admin/assessments/AdminAssessments';
import CreateAssessment from './pages/admin/assessments/CreateAssessment';
import AdminQuestions from './pages/admin/questions/AdminQuestions';
import Dashboard from './pages/user/dashboard/Dashboard';
import { getHomePath } from './utils/roleUtils';
import { useAuth } from './hooks/useAuth';
import CreateQuestion from './pages/admin/questions/CreateQuestion';
import EditAssessment from './pages/admin/assessments/EditAssessment';
import EditQuestion from './pages/admin/questions/EditQuestion';

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
                <Route path="/admin/profile" element={<Profile />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
