import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
            <Outlet />
        </div>
    );
};

export default AuthLayout;