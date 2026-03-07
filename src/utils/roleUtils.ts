export const isAdmin = (role?: string): boolean => {
    return role === 'admin' || role === 'super_admin';
};

export const getHomePath = (role?: string): string => {
    return isAdmin(role) ? '/admin' : '/dashboard';
};
