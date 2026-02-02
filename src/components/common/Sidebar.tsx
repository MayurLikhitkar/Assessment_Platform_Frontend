import React from 'react';
import { NavLink } from 'react-router-dom';
import { Drawer } from '@mui/material';
import {
    Home,
    Assessment,
    Code,
    QueryStats,
    Person,
    AdminPanelSettings,
    Category,
    People,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
    const { user } = useAuth();

    const userNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <Home /> },
        { path: '/assessments', label: 'My Assessments', icon: <Assessment /> },
        { path: '/coding-practice', label: 'Coding Practice', icon: <Code /> },
        { path: '/queries', label: 'SQL Practice', icon: <QueryStats /> },
        { path: '/profile', label: 'Profile', icon: <Person /> },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Admin Dashboard', icon: <AdminPanelSettings /> },
        { path: '/admin/users', label: 'User Management', icon: <People /> },
        { path: '/admin/categories', label: 'Categories', icon: <Category /> },
        { path: '/admin/assessments', label: 'Assessments', icon: <DashboardIcon /> },
        { path: '/admin/questions', label: 'Question Bank', icon: <Code /> },
        { path: '/admin/reports', label: 'Reports', icon: <QueryStats /> },
    ];

    const navItems = user?.role === 'admin' || user?.role === 'super_admin'
        ? adminNavItems
        : userNavItems;

    const drawerContent = (
        <div className="h-full flex flex-col bg-background-light">
            <div className="p-4">
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

                {/* User info */}
                <div className="mt-8 pt-6 border-t border-border-light">
                    <div className="px-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center">
                                    <span className="text-primary-main font-bold">
                                        {user?.firstName?.[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-main">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-text-light capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
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
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 256 },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 bg-background-light border-r border-border-light">
                {drawerContent}
            </div>
        </>
    );
};

export default Sidebar;