import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { UserRole } from "../../types/authTypes";
import { Navigate, Outlet } from "react-router-dom";
import PageLoader from "./PageLoader";

interface RoleGuardProps {
    allowedRoles: UserRole[];
}

interface HasRoleProps extends RoleGuardProps {
    children: React.ReactNode;
}

export const HasRole: React.FC<HasRoleProps> = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    if (!user) return null;

    if (user.role === UserRole.SUPER_ADMIN) return children;

    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    return children;
};

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader text="Checking permissions..." />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;