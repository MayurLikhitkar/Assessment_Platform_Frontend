import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MdMenu,
    MdNotificationsNone,
    MdPersonOutline,
    MdLogout,
    MdSettingsApplications,
} from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../utils/roleUtils';
import Search from '../ui/Search';
import Button from '../ui/Button';

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

    return (
        <header className="sticky top-0 z-9998 bg-background-light backdrop-blur-md border-b border-border-light transition-all duration-200">
            <div className="px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between w-full">
                {/* Left side - Logo and Brand */}
                <div className="flex items-center gap-4">
                    <button
                        className="p-2 text-text-main rounded-full hover:bg-muted-main/20 lg:hidden transition-colors"
                        onClick={onMenuClick}
                        aria-label="open drawer"
                    >
                        <MdMenu className="text-2xl" />
                    </button>

                    <div className="relative z-10 hidden sm:flex items-center gap-2">
                        <Link to={getHomePath(user?.role)} className="flex items-center gap-3 group select-none">
                            <span className="w-10 h-10 bg-primary-main text-text-inverse backdrop-blur-sm rounded-xl flex items-center justify-center font-bold border border-background-light/30">
                                A
                            </span>
                            <span className="text-2xl font-bold text-text-main">AssessHub</span>
                        </Link>
                    </div>
                </div>

                {/* Center - Search Bar */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <Search containerClassName='w-full' className='border-secondary-light/25 rounded-full!' />
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
                            <div className="absolute right-0 mt-2 w-[320px] rounded-xl border border-border-light shadow-lg bg-background-light overflow-hidden z-50 origin-top-right">
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
                        <Button variant='text' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <div className="hidden md:flex flex-col text-right font-semibold">
                                <span className="text-text-main text-sm">
                                    {user?.fullName}
                                </span>
                                <span className="text-text-light uppercase text-xs">
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-md bg-secondary-main text-text-inverse flex items-center justify-center font-bold uppercase">
                                {user?.fullName?.[0] || 'U'}
                            </div>
                        </Button>

                        {/* User Dropdown */}
                        {isMenuOpen && (
                            <div className="absolute right-0 w-[220px] rounded-lg border border-border-light shadow-lg bg-background-light overflow-hidden z-50 origin-top-right">
                                <div className="px-4 py-3 md:hidden font-semibold">
                                    <p className="text-text-main text-sm">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-text-light uppercase text-xs">
                                        {user?.role?.replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="h-px bg-border-light md:hidden mb-1"></div>

                                <div className="p-1">
                                    <button onClick={handleProfile} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm text-text-main hover:bg-muted-light rounded-lg transition-colors">
                                        <MdPersonOutline className="text-lg text-text-light" />
                                        Profile
                                    </button>
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
