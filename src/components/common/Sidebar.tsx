import React from 'react';
import { motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
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
import { LuLayoutDashboard } from 'react-icons/lu';

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();

    const userNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
        { path: '/assessments', label: 'Assessments', icon: MdAssignment },
        { path: '/coding-practice', label: 'Coding Practice', icon: MdCode },
        { path: '/queries', label: 'SQL Practice', icon: MdQueryStats },
        { path: '/profile', label: 'Profile', icon: MdPerson },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Admin Dashboard', icon: MdAdminPanelSettings },
        { path: '/admin/users', label: 'User Management', icon: MdPeople },
        { path: '/admin/assessments', label: 'Assessments', icon: MdDashboard },
        { path: '/admin/questions', label: 'Question Bank', icon: MdCode },
        { path: '/admin/profile', label: 'Profile', icon: MdPerson },
    ];

    const isUserAdmin = isAdmin(user?.role);
    const navItems = isUserAdmin ? adminNavItems : userNavItems;

    const drawerContent = (
        <div className="h-full flex flex-col p-4">
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-muted-main'
                                : 'hover:bg-muted-light'
                                }`}
                            onClick={onClose}>
                            <item.icon title={item.label}
                                className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${isActive
                                    ? 'text-primary-main'
                                    : 'text-text-dark'
                                    }`}
                            />
                            <span className="whitespace-nowrap" >
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="ml-auto w-1 h-5 rounded-full bg-primary-main"
                                />
                            )}
                        </NavLink>
                    )
                })}
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 border-none cursor-default w-full h-full p-0 m-0"
                        onClick={onClose}
                        aria-label="Close menu"
                        tabIndex={-1}
                    ></button>
                    <div className="fixed inset-y-0 left-0 w-64 h-full bg-background-light shadow-2xl animate-in slide-in-from-left duration-300">
                        {drawerContent}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-[260px] shrink-0 h-full overflow-y-auto bg-background-light border-r border-border-light">
                {drawerContent}
            </aside>
        </>
    );
};

export default Sidebar;