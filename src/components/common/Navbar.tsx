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
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
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
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/profile');
        handleMenuClose();
    };

    return (
        <AppBar position="static" elevation={0} className="bg-white border-b">
            <Toolbar className="px-6">
                <div className="flex items-center justify-between w-full">
                    {/* Left side - Logo and Brand */}
                    <div className="flex items-center space-x-4">
                        <IconButton edge="start" color="inherit" className="text-gray-700">
                            <MenuIcon />
                        </IconButton>
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">CA</span>
                            </div>
                            <Typography variant="h6" className="text-gray-900 font-bold">
                                Assessment Platform
                            </Typography>
                        </Link>
                    </div>

                    {/* Right side - User actions */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <IconButton
                            onClick={handleNotificationOpen}
                            className="text-gray-700"
                        >
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <Menu
                            anchorEl={notificationAnchor}
                            open={Boolean(notificationAnchor)}
                            onClose={handleNotificationClose}
                        >
                            <MenuItem>New assessment assigned</MenuItem>
                            <MenuItem>Assessment results available</MenuItem>
                            <MenuItem>System maintenance scheduled</MenuItem>
                        </Menu>

                        {/* User menu */}
                        <div className="flex items-center space-x-2">
                            <Avatar
                                onClick={handleMenuOpen}
                                className="cursor-pointer bg-primary-600"
                            >
                                {user?.firstName?.[0]}
                            </Avatar>
                            <div className="hidden md:block">
                                <Typography variant="body2" className="font-medium">
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                    {user?.role}
                                </Typography>
                            </div>
                        </div>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleProfile}>
                                <PersonIcon fontSize="small" className="mr-2" />
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
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