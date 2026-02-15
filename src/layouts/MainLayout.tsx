import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Container from '../components/common/Container';
import PageLoader from '../components/common/PageLoader';

const MainLayout = () => {
    const { user, isLoading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (isLoading) {
        return <PageLoader text="Authenticating..." fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
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

export default MainLayout;