import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen max-w-screen bg-background-light">
            <Outlet />
        </div>
    );
};

export default AuthLayout;