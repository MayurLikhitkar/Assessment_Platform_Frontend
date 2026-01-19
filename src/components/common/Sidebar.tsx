import React from 'react';
import { NavLink } from 'react-router-dom';
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

const Sidebar: React.FC = () => {
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

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
            <div className="p-4">
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="px-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-700 font-bold">
                                        {user?.firstName?.[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;