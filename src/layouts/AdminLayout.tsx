import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Container from '../components/common/Container';
import PageLoader from '../components/common/PageLoader';

const AdminLayout = () => {
    const { user, isLoading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (isLoading) {
        return <PageLoader text="Authenticating..." fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role guard: only admin and super_admin can access admin routes
    if (user.role !== 'admin' && user.role !== 'super_admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background-main text-text-main">
            <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
            <div className="flex">
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
                <main className='lg:w-[80%] w-full'>
                    <Container>
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
