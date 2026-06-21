import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getHomePath } from '../utils/roleUtils';

const AuthLayout: React.FC = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to={getHomePath(user.role)} replace />;
    }

    return (
        <div className="min-h-screen max-w-screen bg-background-light">
            <Outlet />
        </div>
    );
};

export default AuthLayout;