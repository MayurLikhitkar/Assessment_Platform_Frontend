import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Container from '../components/common/Container';
import PageLoader from '../components/common/PageLoader';
import { isAdmin, getHomePath } from '../utils/roleUtils';

const MainLayout = () => {
    const { user, isLoading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (isLoading) {
        return <PageLoader text="Authenticating..." fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role guard: admins should not access user routes
    if (isAdmin(user.role)) {
        return <Navigate to={getHomePath(user.role)} replace />;
    }

    return (
        <div className="flex h-screen bg-background-main text-text-main">
            <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <main className='lg:w-[80%] w-full h-full overflow-y-auto'>
                <Container>
                    <Outlet />
                </Container>
            </main>
        </div>
    );
};

export default MainLayout;