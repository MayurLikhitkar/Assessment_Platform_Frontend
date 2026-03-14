import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdFilterList, MdMoreVert, MdPersonAdd } from 'react-icons/md';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { getUsers } from '../../../services/axios/adminApi';
import type { UserInterface } from '../../../types/types';
import CreateUserModal from './CreateUserModal';
import Table from '../../../components/ui/Table';

const roleBadgeStyles: Record<string, string> = {
    super_admin: 'bg-primary-light/20 text-primary-dark',
    admin: 'bg-secondary-light/20 text-secondary-dark',
    evaluator: 'bg-accent-light/20 text-accent-dark',
    proctor: 'bg-warn-light/30 text-warn-dark',
    user: 'bg-muted-light text-text-light',
};

const statusStyles: Record<string, string> = {
    active: 'bg-success-light/30 text-success-dark',
    inactive: 'bg-muted-light text-text-light',
    suspended: 'bg-warn-light/30 text-warn-dark',
    banned: 'bg-error-light/30 text-error-dark',
};

const getStatusDotColor = (status: string) => {
    if (status === 'active') return 'bg-success-main';
    if (status === 'banned') return 'bg-error-main';
    return 'bg-text-light';
};

const AdminUsers: React.FC = () => {
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: usersResponse, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: getUsers,
        enabled: !!user,
    });

    const users: UserInterface[] = usersResponse?.data ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">
                        User Management
                    </h1>
                    <p className="text-text-light mt-1">
                        Manage platform users and their roles
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 shadow-sm"
                >
                    <MdPersonAdd fontSize="small" />
                    Add User
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fontSize="small" />
                    <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <MdFilterList fontSize="small" />
                    Filters
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                <Table<UserInterface>
                    data={users}
                    isLoading={isLoading}
                    keyExtractor={(u) => u.id}
                    emptyStateMessage="No users found"
                    emptyStateSubMessage="Users will appear here once they register."
                    emptyStateIcon={<MdPersonAdd className="text-4xl" />}
                    columns={[
                        {
                            header: 'User',
                            accessorKey: 'fullName',
                            cellRenderer: (u) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-secondary-main/20 text-secondary-main flex items-center justify-center text-sm font-bold shrink-0">
                                        {u.fullName?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-text-dark text-sm truncate">{u.fullName}</p>
                                        <p className="text-xs text-text-light truncate">{u.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: 'Role',
                            accessorKey: 'role',
                            cellRenderer: (u) => (
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadgeStyles[u.role] ?? roleBadgeStyles.user}`}>
                                    {u.role?.replace('_', ' ')}
                                </span>
                            ),
                        },
                        {
                            header: 'Status',
                            accessorKey: 'status',
                            cellRenderer: (u) => (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[u.status] ?? statusStyles.inactive}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(u.status)}`}></span>
                                    {u.status}
                                </span>
                            ),
                        },
                        {
                            header: 'Joined',
                            accessorKey: 'createdAt',
                            className: 'hidden md:table-cell',
                            valueGetter: (u) =>
                                u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : '—',
                        },
                        {
                            header: 'Last Login',
                            accessorKey: 'lastLogin',
                            className: 'hidden lg:table-cell',
                            valueGetter: (u) =>
                                u.lastLogin
                                    ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : 'Never',
                        },
                        {
                            header: 'Actions',
                            className: 'text-right',
                            cellRenderer: () => (
                                <div className="text-right">
                                    <button className="p-1.5 rounded-lg hover:bg-muted-light text-text-light hover:text-text-dark transition-colors">
                                        <MdMoreVert fontSize="small" />
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                />

                {/* Footer */}
                {users.length > 0 && (
                    <div className="px-5 py-3 border-t border-border-light bg-muted-light/20 flex items-center justify-between text-sm text-text-light">
                        <span>Showing {users.length} user{users.length === 1 ? '' : 's'}</span>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
            />
        </div>
    );
};

export default AdminUsers;
