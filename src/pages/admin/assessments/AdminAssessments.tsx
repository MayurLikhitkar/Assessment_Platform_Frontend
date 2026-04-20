import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdAdd, MdAssignment } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { getAdminAssessments } from '../../../services/axios/adminApi';
import type { AssessmentInterface } from '../../../types/assessmentTypes';
import AgGridTable from '../../../components/common/AgGridTable';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';
import ActionCell from '../../../components/common/ActionCell';

const difficultyColors: Record<string, string> = {
    beginner: 'bg-success-light/40 text-success-dark',
    intermediate: 'bg-secondary-light/20 text-secondary-dark',
    advanced: 'bg-warn-light/40 text-warn-dark',
    expert: 'bg-error-light/40 text-error-dark',
};

const typeColors: Record<string, string> = {
    mcq: 'bg-secondary-light/20 text-secondary-dark',
    coding: 'bg-accent-light/30 text-accent-dark',
    query: 'bg-warn-light/30 text-warn-dark',
    subjective: 'bg-muted-light text-dark-main',
};

const AdminAssessments: React.FC = () => {
    const navigate = useNavigate();


    const { data: assessmentsData } = useQuery({
        queryKey: ['adminAssessments'],
        queryFn: getAdminAssessments,
    });

    const assessments = assessmentsData?.data || [];

    const activeCount = assessments.filter((a: AssessmentInterface) => a.isActive).length;
    const inactiveCount = assessments.filter((a: AssessmentInterface) => !a.isActive).length;

    const columnDefs = useMemo<ColDef<AssessmentInterface>[]>(() => [
        {
            headerName: 'Title',
            field: 'title',
            minWidth: 220,
            flex: 2,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return null;
                return (
                    <div className="py-1">
                        <p className="font-medium text-text-dark text-sm">{params.data.title}</p>
                        <p className="text-xs text-text-light mt-0.5 line-clamp-1">{params.data.description}</p>
                    </div>
                );
            },
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 150,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return null;
                return (
                    <div className="flex flex-wrap gap-1">
                        {params.data.type.map((t) => (
                            <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${typeColors[t] || 'bg-muted-light text-text-light'}`}>
                                {t}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            headerName: 'Difficulty',
            field: 'difficulty',
            minWidth: 120,
            flex: 1,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return null;
                const diff = params.data.difficulty;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[diff] || 'bg-muted-light text-text-light'}`}>
                        {diff}
                    </span>
                );
            },
        },
        {
            headerName: 'Duration',
            field: 'durationInMinutes',
            minWidth: 100,
            flex: 0.7,
            valueGetter: (params) => {
                if (!params.data) return '';
                return <span>{params.data.durationInMinutes} mins</span>;
            },
        },
        {
            headerName: 'Marks',
            field: 'totalMarks',
            minWidth: 80,
            flex: 0.5,
        },
        {
            headerName: 'Questions',
            minWidth: 100,
            flex: 0.7,
            valueGetter: (params) => {
                if (!params.data) return 0;
                return params.data.questions?.length || 0;
            },
        },
        {
            headerName: 'Status',
            field: 'isActive',
            minWidth: 100,
            flex: 0.7,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return null;
                const isActive = params.data.isActive;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-success-light/40 text-success-dark'
                        : 'bg-error-light/40 text-error-dark'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            headerName: 'Actions',
            minWidth: 100,
            maxWidth: 100,
            filter: false,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => (
                <ActionCell
                    onView={() => console.log('View', params.data)}
                    onEdit={() => console.log('Edit', params.data)}
                />
            ),
        },
    ], []);

    return (
        <Page>
            <PageBody className='py-5'>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageTitle title="Assessments" description="Manage all assessments on the platform" icon={MdAssignment} />
                    <Button
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/admin/assessments/create')}
                    >
                        <MdAdd className="text-xl" />
                        Create Assessment
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-secondary-light/20 rounded-lg text-secondary-main">
                            <MdAssignment className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{assessments.length}</p>
                            <p className="text-sm text-text-light">Total Assessments</p>
                        </div>
                    </div>
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-success-light/30 rounded-lg text-success-main">
                            <MdAssignment className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{activeCount}</p>
                            <p className="text-sm text-text-light">Active</p>
                        </div>
                    </div>
                    <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4 flex items-center gap-4">
                        <div className="p-3 bg-error-light/30 rounded-lg text-error-main">
                            <MdAssignment className="text-2xl" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text-dark">{inactiveCount}</p>
                            <p className="text-sm text-text-light">Inactive</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <AgGridTable<AssessmentInterface>
                    rowData={assessments}
                    columnDefs={columnDefs}
                />
            </PageBody>
        </Page>
    );
};

export default AdminAssessments;
