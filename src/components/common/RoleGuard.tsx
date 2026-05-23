import React, { type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../services/axios/authApi";
import { UserRole } from "../../types/authTypes";

interface RoleGuardProps {
    role?: UserRole[];
    children: ReactNode;
}

// export const hasAccess = (accessId: number) => {
//     const user = useAppSelector(state => state.auth.userData);
//     if (!user) return false;

//     const isSuperAdmin = user.roleId === ROLE_ID.superAdmin;

//     if (isSuperAdmin) return true;

//     return user.access.some(a => a.accessId === accessId);
// };

const RoleGuard: React.FC<RoleGuardProps> = ({ role = [UserRole.SUPER_ADMIN], children }) => {
    const { user } = useAuth();

    // Fetch user profile data
    const { data: profileData } = useQuery({
        queryKey: ['userProfile', user?.id],
        queryFn: () => getProfile(),
        enabled: !!user,
    });

    if (!profileData?.data.role) {
        return null;
    }

    if (profileData?.data.role === UserRole.SUPER_ADMIN) {
        return children;   // Super admin bypass
    }

    const hasRole = role.includes(profileData?.data.role);

    if (hasRole) {
        return children;
    }

    return null;
};

export default RoleGuard;