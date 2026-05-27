import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdPeople, MdPersonAdd } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import { getUsers } from '../../../services/axios/adminApi';
import { UserRole, UserStatus, type UserInterface } from '../../../types/authTypes';
import CreateUserModal from './CreateUserModal';
import AgGridTable from '../../../components/common/AgGridTable';
import moment from 'moment';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';
import DataLoader from '../../../components/common/DataLoader';
import RoleGuard from '../../../components/common/RoleGuard';

const AdminUsers: React.FC = () => {
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: usersResponse, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: getUsers,
        enabled: !!user,
    });

    const users: UserInterface[] = usersResponse?.data ?? [];

    const columnDefs = useMemo<ColDef<UserInterface>[]>(() => [
        {
            headerName: 'User',
            field: 'fullName',
            minWidth: 220,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data?.fullName) return 'N/A';
                const name = params.data.fullName;
                return (
                    <div className="flex items-center gap-3">
                        <div className="min-w-10 rounded flex items-center justify-center bg-secondary-main/20 text-secondary-dark font-bold">
                            {name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="font-medium text-text-main truncate">
                            {name}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: 'Email',
            field: 'email',
            minWidth: 220,
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Role',
            field: 'role',
            minWidth: 130,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data?.role) return 'N/A';
                const colorMap: Record<UserRole, string> = {
                    [UserRole.SUPER_ADMIN]: 'text-error-dark bg-error-main/20',
                    [UserRole.ADMIN]: 'text-secondary-main bg-secondary-main/20',
                    [UserRole.EVALUATOR]: 'text-primary-main bg-primary-light/20',
                    [UserRole.PROCTOR]: 'text-warn-dark bg-warn-main/20',
                    [UserRole.USER]: 'text-text-main bg-muted-main',
                };
                const role = params.data.role;
                return (
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium capitalize ${colorMap[role]}`}>
                        {role.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            headerName: 'Status',
            field: 'status',
            minWidth: 120,
            cellRenderer: (params: ICellRendererParams<UserInterface>) => {
                if (!params.data?.status) return 'N/A';
                const colorMap: Record<UserStatus, string> = {
                    [UserStatus.INACTIVE]: 'text-error-dark bg-error-main/20',
                    [UserStatus.ACTIVE]: 'text-success-main bg-success-main/20',
                    [UserStatus.SUSPENDED]: 'text-primary-main bg-primary-light/20',
                    [UserStatus.BANNED]: 'text-warn-dark bg-warn-main/20',
                };
                const status = params.data.status;
                return (
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium capitalize ${colorMap[status]}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            headerName: 'Joined',
            field: 'createdAt',
            minWidth: 130,
            valueGetter: (params) => {
                if (!params.data?.createdAt) return '—';
                return moment(params.data.createdAt).format('DD MMM YYYY');
            },
        },
        {
            headerName: 'Last Login',
            field: 'lastLogin',
            minWidth: 130,
            valueGetter: (params) => {
                if (!params.data?.lastLogin) return 'Never';
                return moment(params.data.lastLogin).format('DD MMM YYYY');
            },
        },
    ], []);

    return (
        <Page>
            <PageBody className='py-5'>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageTitle title="Users" icon={MdPeople} description="Manage platform users and their roles" />
                    <RoleGuard role={[UserRole.ADMIN]}>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 shadow-sm"
                        >
                            <MdPersonAdd fontSize="small" />
                            Add User
                        </Button>
                    </RoleGuard>
                </div>

                {/* Users Table */}
                {isLoading ? (
                    <DataLoader />
                ) : (
                    <AgGridTable<UserInterface>
                        loading={isLoading}
                        rowData={users}
                        columnDefs={columnDefs}
                    />
                )}
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
