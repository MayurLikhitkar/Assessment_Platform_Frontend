import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AuthLayout from './layouts/AuthLayout';
import Register from './pages/auth/Register';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { TOASTER_PROPS } from './utils/config';
import Dashboard from './pages/dashboard/Dashboard';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './services/queryClient';
import MainLayout from './layouts/MainLayout';
import Assessments from './pages/user/Assessments';
import Profile from './pages/user/Profile';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster {...TOASTER_PROPS} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* User Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
