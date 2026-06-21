import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import PageLoader from '../components/common/PageLoader';

const AppLayout: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (isLoading) {
        return <PageLoader text="Authenticating..." fullScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="h-screen flex flex-col bg-background-main text-text-main">
            <Navbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
            <div className='flex flex-1 overflow-hidden'>
                <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
                <main className='flex-1 overflow-y-auto'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
