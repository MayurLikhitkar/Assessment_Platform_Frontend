import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MdMenu,
    MdNotificationsNone,
    MdPersonOutline,
    MdLogout,
    MdSettingsApplications,
    MdSearch,
} from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { isAdmin, getHomePath } from '../../utils/roleUtils';

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsMenuOpen(false);
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const handleAdminPanel = () => {
        navigate('/admin');
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-9998 bg-background-light/80 backdrop-blur-md border-b border-border-light transition-all duration-200">
            <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between w-full">
                {/* Left side - Logo and Brand */}
                <div className="flex items-center gap-4 sm:gap-8">
                    <button
                        className="p-2 -ml-2 text-text-main rounded-full hover:bg-muted-main/20 lg:hidden transition-colors"
                        onClick={onMenuClick}
                        aria-label="open drawer"
                    >
                        <MdMenu className="text-2xl" />
                    </button>

                    <Link to={getHomePath(user?.role)} className="flex items-center gap-3 group select-none">
                        <div className="relative z-10 hidden sm:flex items-center gap-2">
                            <span className="w-10 h-10 bg-primary-main/70 text-white backdrop-blur-sm rounded-xl flex items-center justify-center font-bold border border-background-light/30">
                                A
                            </span>
                            <span className="text-2xl font-bold tracking-tight text-text-dark">AssessPro</span>
                        </div>
                    </Link>
                </div>

                {/* Center - Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="text-lg text-text-light group-focus-within:text-primary-main transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            className="w-full bg-muted-light/50 hover:bg-muted-light focus:bg-background-light border border-transparent focus:border-primary-light/30 rounded-full py-2 pl-10 pr-4 text-sm text-text-main placeholder-text-light/70 focus:ring-4 focus:ring-primary-light/10 transition-all duration-200 outline-none"
                        />
                    </div>
                </div>

                {/* Right side - User actions */}
                <div className="flex items-center gap-1 sm:gap-3">
                    {/* Notifications */}
                    <div title="Notifications" className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`p-2 rounded-full transition-all duration-200 relative ${isNotificationOpen ? 'bg-primary-light/10 text-primary-main' : 'text-text-light hover:text-primary-main hover:bg-muted-light'}`}
                        >
                            <MdNotificationsNone className="text-2xl" />
                            {/* Badge */}
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-main opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-error-main ring-2 ring-background-light"></span>
                            </span>
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-[320px] rounded-xl border border-border-light shadow-lg shadow-black/5 bg-background-light overflow-hidden z-50 origin-top-right">
                                <div className="px-4 py-3 border-b border-border-light bg-muted-light/30">
                                    <span className="text-sm font-bold text-text-main">Notifications</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <button onClick={() => setIsNotificationOpen(false)} className="w-full text-left py-3 px-4 hover:bg-muted-light/50 border-b border-border-light/50 flex gap-3 transition-colors">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary-main shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-text-main">New assessment assigned</p>
                                            <p className="text-xs text-text-light mt-0.5">Just now</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setIsNotificationOpen(false)} className="w-full text-left py-3 px-4 hover:bg-muted-light/50 border-b border-border-light/50 flex gap-3 transition-colors">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-secondary-main shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-text-main">Assessment results available</p>
                                            <p className="text-xs text-text-light mt-0.5">2 hours ago</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setIsNotificationOpen(false)} className="w-full text-left py-3 px-4 hover:bg-muted-light/50 flex gap-3 transition-colors">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-warn-main shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-medium text-text-main">System maintenance</p>
                                            <p className="text-xs text-text-light mt-0.5">Tomorrow at 12:00 PM</p>
                                        </div>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-border-light bg-muted-light/30 text-center">
                                    <button className="text-xs text-primary-main font-medium hover:underline transition-all">
                                        Mark all as read
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-border-light mx-1 hidden sm:block"></div>

                    {/* User menu */}
                    <div title="Account settings" className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-200 border ${isMenuOpen ? 'bg-background-light border-primary-light/50 shadow-sm ring-2 ring-primary-light/20' : 'border-transparent hover:bg-muted-light hover:border-border-light'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-secondary-main text-white flex items-center justify-center text-sm font-bold ring-2 ring-background-light shrink-0 uppercase">
                                {user?.fullName?.[0] || 'U'}
                            </div>
                            <div className="hidden md:flex flex-col items-start text-left">
                                <span className="text-text-main font-semibold leading-none text-sm">
                                    {user?.fullName}
                                </span>
                                <span className="text-text-light text-[10px] font-medium mt-0.5 uppercase tracking-wide">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                        </button>

                        {/* User Dropdown */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-[220px] rounded-xl border border-border-light shadow-lg shadow-black/5 bg-background-light overflow-hidden z-50 origin-top-right">
                                <div className="px-4 py-3 md:hidden">
                                    <p className="text-sm font-bold text-text-main">{user?.fullName}</p>
                                    <p className="text-xs text-text-light capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <div className="h-px bg-border-light md:hidden mb-1"></div>

                                <div className="p-1">
                                    {isAdmin(user?.role) ? (
                                        <button onClick={handleAdminPanel} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-text-main hover:bg-muted-light rounded-lg transition-colors">
                                            <MdSettingsApplications className="text-lg text-text-light" />
                                            Admin Panel
                                        </button>
                                    ) : (
                                        <button onClick={handleProfile} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-text-main hover:bg-muted-light rounded-lg transition-colors">
                                            <MdPersonOutline className="text-lg text-text-light" />
                                            Profile
                                        </button>
                                    )}
                                    <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-text-main hover:bg-muted-light rounded-lg transition-colors">
                                        <MdSettingsApplications className="text-lg text-text-light" />
                                        Settings
                                    </button>
                                    <div className="h-px bg-border-light my-1"></div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-error-main hover:bg-error-light/10 rounded-lg transition-colors">
                                        <MdLogout className="text-lg text-error-main" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
