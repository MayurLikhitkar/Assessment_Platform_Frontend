import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer } from '@mui/material';
import {
    MdHome,
    MdAssignment,
    MdCode,
    MdQueryStats,
    MdPerson,
    MdAdminPanelSettings,
    MdPeople,
    MdDashboard,
} from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin } from '../../utils/roleUtils';

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
    const { user } = useAuth();

    const userNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <MdHome className="text-xl" /> },
        { path: '/assessments', label: 'My Assessments', icon: <MdAssignment className="text-xl" /> },
        { path: '/coding-practice', label: 'Coding Practice', icon: <MdCode className="text-xl" /> },
        { path: '/queries', label: 'SQL Practice', icon: <MdQueryStats className="text-xl" /> },
        { path: '/profile', label: 'Profile', icon: <MdPerson className="text-xl" /> },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Admin Dashboard', icon: <MdAdminPanelSettings className="text-xl" /> },
        { path: '/admin/users', label: 'User Management', icon: <MdPeople className="text-xl" /> },
        { path: '/admin/assessments', label: 'Assessments', icon: <MdDashboard className="text-xl" /> },
        { path: '/admin/questions', label: 'Question Bank', icon: <MdCode className="text-xl" /> },
        { path: '/admin/reports', label: 'Reports', icon: <MdQueryStats className="text-xl" /> },
        { path: '/profile', label: 'Profile', icon: <MdPerson className="text-xl" /> },
    ];

    const isUserAdmin = isAdmin(user?.role);
    const navItems = isUserAdmin ? adminNavItems : userNavItems;

    const drawerContent = (
        <div className="h-full flex flex-col bg-background-light">
            <div className="p-4">
                <div className="mb-4 px-2">
                    <h3 className="text-xs font-bold text-text-light uppercase tracking-wider">
                        {isUserAdmin ? 'Admin Panel' : 'User Menu'}
                    </h3>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${isActive
                                    ? 'bg-primary-light/10 text-primary-main'
                                    : 'text-text-main hover:bg-muted-light'
                                }`
                            }
                            onClick={onClose}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );

    return (
        <aside className='hidden lg:block w-[20%]'>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Sidebar */}
            <div className="h-full! bg-background-light border-r border-border-light">
                {drawerContent}
            </div>
        </aside>
    );
};

export default Sidebar;