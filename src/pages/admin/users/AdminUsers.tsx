import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdPeople, MdPersonAdd } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import { getUsers } from '../../../services/axios/adminApi';
import type { UserInterface } from '../../../types/authTypes';
import CreateUserModal from './CreateUserModal';
import AgGridTable from '../../../components/common/AgGridTable';
import Search from '../../../components/ui/Search';
import moment from 'moment';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';

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
    const [searchText, setSearchText] = useState('');
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: usersResponse } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: getUsers,
        enabled: !!user,
    });

    const users: UserInterface[] = usersResponse?.data ?? [];

    const filteredUsers = useMemo(() => {
        if (!searchText) return users;
        const lower = searchText.toLowerCase();
        return users.filter((u) => {
            const joinedDate = moment(u.createdAt).format('DD MMM, YYYY');
            return (
                u.id?.toString().includes(lower) ||
                u.fullName.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower) ||
                (u.phone ?? '').toLowerCase().includes(lower) ||
                joinedDate.toLowerCase().includes(lower)
            );
        });
    }, [searchText, users]);

    const columnDefs = useMemo<ColDef<UserInterface>[]>(() => [
        {
            headerName: 'User',
            field: 'fullName',
            minWidth: 220,
            flex: 2,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data) return null;
                const u = params.data;
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 rounded-full bg-secondary-main/20 text-secondary-main flex items-center justify-center text-sm font-bold shrink-0">
                            {u.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-text-dark text-sm truncate">{u.fullName}</p>
                            <p className="text-xs text-text-light truncate">{u.email}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: 'Role',
            field: 'role',
            minWidth: 130,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data) return null;
                const role = params.data.role;
                return (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadgeStyles[role] ?? roleBadgeStyles.user}`}>
                        {role?.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            headerName: 'Status',
            field: 'status',
            minWidth: 120,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data) return null;
                const status = params.data.status;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status] ?? statusStyles.inactive}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(status)}`}></span>
                        {status}
                    </span>
                );
            },
        },
        {
            headerName: 'Joined',
            field: 'createdAt',
            minWidth: 130,
            flex: 1,
            valueGetter: (params) => {
                if (!params.data?.createdAt) return '—';
                return new Date(params.data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            },
        },
        {
            headerName: 'Last Login',
            field: 'lastLogin',
            minWidth: 130,
            flex: 1,
            valueGetter: (params) => {
                if (!params.data?.lastLogin) return 'Never';
                return new Date(params.data.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            },
        },
    ], []);

    return (
        <Page>
            <PageBody className='py-5'>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageTitle title="Users" icon={MdPeople} description="Manage platform users and their roles" />
                    <Button
                        variant="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 shadow-sm"
                    >
                        <MdPersonAdd fontSize="small" />
                        Add User
                    </Button>
                </div>

                {/* Users Table */}
                <AgGridTable<UserInterface>
                    leftSection={<Search value={searchText} onChange={(e) => setSearchText(e.target.value)} handleClear={() => setSearchText('')} />}
                    rowData={filteredUsers}
                    columnDefs={columnDefs}
                />
            </PageBody>
            {/* Create User Modal */}
            <CreateUserModal
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
            />
        </Page>
    );
};

export default AdminUsers;
