import { UserRole } from '../types/authTypes';
import {
    MdAssignment,
    MdCode,
    MdQueryStats,
    MdPerson,
    MdAdminPanelSettings,
    MdPeople,
    MdDashboard,
} from 'react-icons/md';
import { LuLayoutDashboard } from 'react-icons/lu';
import type { IconType } from 'react-icons/lib';

export interface NavItem {
    path: string;
    label: string;
    icon: IconType;
    roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
    // USER
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LuLayoutDashboard,
        roles: [UserRole.USER],
    },
    {
        path: '/assessments',
        label: 'Assessments',
        icon: MdAssignment,
        roles: [UserRole.USER],
    },
    {
        path: '/coding-practice',
        label: 'Coding Practice',
        icon: MdCode,
        roles: [UserRole.USER],
    },
    {
        path: '/sql-practice',
        label: 'SQL Practice',
        icon: MdQueryStats,
        roles: [UserRole.USER],
    },
    {
        path: '/profile',
        label: 'Profile',
        icon: MdPerson,
        roles: [UserRole.USER],
    },

    // ADMIN
    {
        path: '/app',
        label: 'Dashboard',
        icon: MdAdminPanelSettings,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR],
    },
    {
        path: '/app/users',
        label: 'User Management',
        icon: MdPeople,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR],
    },
    {
        path: '/app/assessments',
        label: 'Assessments',
        icon: MdDashboard,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR],
    },
    {
        path: '/app/questions',
        label: 'Questions',
        icon: MdCode,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR],
    },
    {
        path: '/app/profile',
        label: 'Profile',
        icon: MdPerson,
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EVALUATOR, UserRole.PROCTOR],
    },
];