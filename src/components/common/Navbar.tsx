import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Badge,
    Tooltip,
    Box,
    Divider,
    ListItemIcon,
} from '@mui/material';
import {
    Menu as MenuIcon,
    NotificationsOutlined,
    PersonOutline,
    Logout,
    SettingsOutlined,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
    onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleNotificationClose = () => {
        setNotificationAnchor(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            className="bg-background-light/80 backdrop-blur-md border-b border-border-light top-0 z-50 transition-all duration-200"
        >
            <Toolbar className="px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
                <div className="flex items-center justify-between w-full">
                    {/* Left side - Logo and Brand */}
                    <div className="flex items-center gap-4 sm:gap-8">
                        <IconButton
                            edge="start"
                            className="text-text-main hover:bg-muted-main/20 lg:hidden!"
                            onClick={onMenuClick}
                            aria-label="open drawer"
                        >
                            <MenuIcon />
                        </IconButton>

                        <Link to="/dashboard" className="flex items-center gap-3 group select-none">
                            <div className="relative z-10 hidden sm:flex items-center gap-2">
                                <span className="w-10 h-10 bg-primary-main/70 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold border border-background-light/30">
                                    A
                                </span>
                                <span className="text-2xl font-bold tracking-tight">AssessPro</span>
                            </div>
                        </Link>
                    </div>

                    {/* Center - Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="text-text-light group-focus-within:text-primary-main transition-colors" fontSize="small" />
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
                        <Tooltip title="Notifications">
                            <IconButton
                                onClick={handleNotificationOpen}
                                className={`transition-all duration-200 ${notificationAnchor ? 'bg-primary-light/10 text-primary-main' : 'text-text-light hover:text-primary-main hover:bg-muted-light'}`}
                            >
                                <Badge
                                    badgeContent={3}
                                    color="error"
                                    variant="dot"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: 'var(--color-error-main)',
                                            boxShadow: '0 0 0 2px var(--color-background-light)'
                                        }
                                    }}
                                >
                                    <NotificationsOutlined />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={notificationAnchor}
                            open={Boolean(notificationAnchor)}
                            onClose={handleNotificationClose}
                            PaperProps={{
                                elevation: 0,
                                className: "mt-2 rounded-xl border border-border-light shadow-lg shadow-black/5 min-w-[320px] overflow-hidden"
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box className="px-4 py-3 border-b border-border-light bg-muted-light/30">
                                <Typography variant="subtitle2" className="font-bold text-text-main">Notifications</Typography>
                            </Box>
                            <div className="max-h-[300px] overflow-y-auto">
                                <MenuItem onClick={handleNotificationClose} className="py-3 px-4 hover:bg-muted-light/50 border-b border-border-light/50">
                                    <Box className="flex gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary-main flex-shrink-0"></div>
                                        <div>
                                            <Typography variant="body2" className="font-medium text-text-main">New assessment assigned</Typography>
                                            <Typography variant="caption" className="text-text-light">Just now</Typography>
                                        </div>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={handleNotificationClose} className="py-3 px-4 hover:bg-muted-light/50 border-b border-border-light/50">
                                    <Box className="flex gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-secondary-main flex-shrink-0"></div>
                                        <div>
                                            <Typography variant="body2" className="font-medium text-text-main">Assessment results available</Typography>
                                            <Typography variant="caption" className="text-text-light">2 hours ago</Typography>
                                        </div>
                                    </Box>
                                </MenuItem>
                                <MenuItem onClick={handleNotificationClose} className="py-3 px-4 hover:bg-muted-light/50">
                                    <Box className="flex gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-warn-main flex-shrink-0"></div>
                                        <div>
                                            <Typography variant="body2" className="font-medium text-text-main">System maintenance</Typography>
                                            <Typography variant="caption" className="text-text-light">Tomorrow at 12:00 PM</Typography>
                                        </div>
                                    </Box>
                                </MenuItem>
                            </div>
                            <Box className="p-2 border-t border-border-light bg-muted-light/30 text-center">
                                <Typography variant="caption" className="text-primary-main font-medium cursor-pointer hover:underline">
                                    Mark all as read
                                </Typography>
                            </Box>
                        </Menu>

                        <div className="h-6 w-[1px] bg-border-light mx-1 hidden sm:block"></div>

                        {/* User menu */}
                        <Tooltip title="Account settings">
                            <button
                                onClick={handleMenuOpen}
                                className={`flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-200 border ${anchorEl ? 'bg-background-light border-primary-light/50 shadow-sm ring-2 ring-primary-light/20' : 'border-transparent hover:bg-muted-light hover:border-border-light'}`}
                            >
                                <Avatar
                                    className="w-8 h-8 text-sm font-bold ring-2 ring-background-light"
                                    sx={{
                                        bgcolor: 'var(--color-secondary-main)',
                                        color: 'var(--color-text-inverse)'
                                    }}
                                >
                                    {user?.fullName?.[0]}
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start text-left">
                                    <Typography variant="subtitle2" className="text-text-main font-semibold leading-none text-sm">
                                        {user?.fullName}
                                    </Typography>
                                    <Typography variant="caption" className="text-text-light text-[10px] font-medium mt-0.5 uppercase tracking-wide">
                                        {user?.role?.replace('_', ' ')}
                                    </Typography>
                                </div>
                            </button>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                className: "mt-2 rounded-xl border border-border-light shadow-lg shadow-black/5 min-w-[220px]"
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box className="px-4 py-3 md:hidden">
                                <Typography variant="subtitle2" className="font-bold text-text-main">{user?.fullName}</Typography>
                                <Typography variant="caption" className="text-text-light capitalize">{user?.role?.replace('_', ' ')}</Typography>
                            </Box>
                            <Divider className="md:hidden mb-1" />

                            <MenuItem onClick={handleProfile} className="py-2.5 px-4 text-sm text-text-main hover:bg-muted-light/50 mx-1 rounded-lg transition-colors">
                                <ListItemIcon className="min-w-[36px]">
                                    <PersonOutline fontSize="small" className="text-text-light" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} className="py-2.5 px-4 text-sm text-text-main hover:bg-muted-light/50 mx-1 rounded-lg transition-colors">
                                <ListItemIcon className="min-w-[36px]">
                                    <SettingsOutlined fontSize="small" className="text-text-light" />
                                </ListItemIcon>
                                Settings
                            </MenuItem>
                            <Divider className="my-1" />
                            <MenuItem onClick={handleLogout} className="py-2.5 px-4 text-sm text-error-main hover:bg-error-light/10 mx-1 rounded-lg transition-colors">
                                <ListItemIcon className="min-w-[36px]">
                                    <Logout fontSize="small" className="text-error-main" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
