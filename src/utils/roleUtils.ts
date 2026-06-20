import type { UserRole } from "../types/authTypes";

const HOME_ROUTES: Record<UserRole, string> = {
    user: '/dashboard',
    admin: '/app/dashboard',
    super_admin: '/app/dashboard',
    evaluator: '/app/dashboard',
    proctor: '/app/dashboard',
};

export const isAdmin = (role?: UserRole): boolean => {
    return role === 'admin' || role === 'super_admin';
};

export const getHomePath = (role?: UserRole): string => {
    if (!role) return '/login';
    return HOME_ROUTES[role] ?? '/';
};
