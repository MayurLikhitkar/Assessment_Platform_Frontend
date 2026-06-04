import React from 'react';
import { NavLink } from 'react-router-dom';
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
                            `flex items-center px-4 py-3 gap-3 text-sm font-medium rounded-lg transition-colors mb-1 ${isActive
                                ? 'bg-primary-light/10 text-primary-main'
                                : 'text-text-main hover:bg-muted-light'
                            }`
                        }
                        onClick={onClose}
                    >
                        <item.icon className="text-xl" />
                        {item.label}
                    </NavLink>
                ))}
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