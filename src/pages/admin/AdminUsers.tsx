import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdFilterList, MdMoreVert, MdPersonAdd } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import DataLoader from '../../components/common/DataLoader';
import { getUsers } from '../../services/axios/adminApi';
import type { UserInterface } from '../../types/types';

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
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-sm">
                    <MdPersonAdd fontSize="small" />
                    Add User
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" fontSize="small" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        className="w-full bg-background-light border border-border-light/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-main placeholder-text-light focus:border-primary-light/50 focus:ring-2 focus:ring-primary-light/10 outline-none transition-all"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-light border border-border-light/50 rounded-lg text-sm text-text-main hover:bg-muted-light transition-colors">
                    <MdFilterList fontSize="small" />
                    Filters
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        <DataLoader />
                    </div>
                ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-light bg-muted-light/30">
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Status</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider hidden md:table-cell">Joined</th>
                                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider hidden lg:table-cell">Last Login</th>
                                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted-light/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-secondary-main/20 text-secondary-main flex items-center justify-center text-sm font-bold shrink-0">
                                                    {u.fullName?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-text-dark text-sm truncate">{u.fullName}</p>
                                                    <p className="text-xs text-text-light truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadgeStyles[u.role] ?? roleBadgeStyles.user}`}>
                                                {u.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[u.status] ?? statusStyles.inactive}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(u.status)}`}></span>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-text-light hidden md:table-cell">
                                            {u.createdAt
                                                ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-text-light hidden lg:table-cell">
                                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-muted-light text-text-light hover:text-text-dark transition-colors">
                                                <MdMoreVert fontSize="small" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center gap-2">
                        <MdPersonAdd className="text-4xl" />
                        <p className="text-text-light font-medium">No users found</p>
                        <p className="text-sm text-text-light">Users will appear here once they register.</p>
                    </div>
                )}

                {/* Footer */}
                {users.length > 0 && (
                    <div className="px-5 py-3 border-t border-border-light bg-muted-light/20 flex items-center justify-between text-sm text-text-light">
                        <span>Showing {users.length} user{users.length === 1 ? '' : 's'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
