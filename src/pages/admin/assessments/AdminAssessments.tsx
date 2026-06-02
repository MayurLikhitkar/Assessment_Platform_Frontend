import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdAdd, MdAssignment } from 'react-icons/md';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { getAdminAssessments } from '../../../services/axios/adminApi';
import type { AssessmentDifficulty, AssessmentInterface } from '../../../types/assessmentTypes';
import AgGridTable from '../../../components/common/AgGridTable';
import { Page, PageBody, PageTitle } from '../../../components/ui/Page';
import ActionCell from '../../../components/common/ActionCell';
import DataLoader from '../../../components/common/DataLoader';
import moment from 'moment';

const AdminAssessments: React.FC = () => {
    const navigate = useNavigate();

    const { data: assessmentsData, isLoading } = useQuery({
        queryKey: ['adminAssessments'],
        queryFn: getAdminAssessments,
    });

    const assessments = assessmentsData?.data || [];

    const activeCount = assessments.filter((a) => a.isActive).length;
    const inactiveCount = assessments.filter((a) => !a.isActive).length;

    const columnDefs = useMemo<ColDef<AssessmentInterface>[]>(() => [
        {
            headerName: 'Title',
            field: 'title',
            minWidth: 100,
            cellClass: 'font-semibold',
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.title) return 'N/A';
                return params.data.title;
            },
        },
        {
            headerName: 'Type',
            field: 'type',
            minWidth: 100,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.type) return 'N/A';
                const type = params.data.type;
                return (
                    <div className="space-x-2">
                        {type.map((type, index) => (
                            <span
                                key={index + 1}
                                className="bg-secondary-light/20 text-secondary-main px-2 py-0.5 rounded text-xs uppercase font-semibold"
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            headerName: 'Difficulty',
            field: 'difficulty',
            minWidth: 130,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.difficulty) return 'N/A';
                const difficulty = params.data.difficulty;
                const colorMap: Record<AssessmentDifficulty, string> = {
                    beginner: 'text-success-main bg-success-main/20',
                    intermediate: 'text-primary-main bg-primary-main/20',
                    advanced: 'text-warn-main bg-warn-main/20',
                    expert: 'text-error-main bg-error-main/20',
                };
                return (
                    <span className={`${colorMap[difficulty]} px-2 py-0.5 rounded text-xs capitalize font-semibold`}>
                        {difficulty}
                    </span>
                );
            },
        },
        {
            headerName: 'Start Date',
            field: 'startDate',
            minWidth: 150,
            valueGetter: (params) => {  // ← ADD THIS
                if (!params.data?.startDate) return 'N/A';
                return moment(params.data.startDate).format('DD MMM YYYY h:mm A');
            },
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.startDate) return 'N/A';
                return <div>
                    <span className='font-medium'>{moment(params.data.startDate).format('DD MMM YYYY')}</span>
                    <span className='bg-secondary-main/20 text-secondary-dark px-2 py-0.5 rounded font-semibold ml-1'>{moment(params.data.startDate).format('h:mm A')}</span>
                </div>;
            },
        },
        {
            headerName: 'End Date',
            field: 'endDate',
            minWidth: 150,
            valueGetter: (params) => {  // ← ADD THIS
                if (!params.data?.endDate) return 'N/A';
                return moment(params.data.endDate).format('DD MMM YYYY h:mm A');
            },
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.endDate) return 'N/A';
                return <div>
                    <span className='font-medium'>{moment(params.data.endDate).format('DD MMM YYYY')}</span>
                    <span className='bg-error-main/20 text-error-dark px-2 py-0.5 rounded font-semibold ml-1'>{moment(params.data.endDate).format('h:mm A')}</span>
                </div>;
            },
        },
        {
            headerName: 'Tags',
            field: 'tags',
            minWidth: 150,
            valueGetter: (params) => {
                if (!params.data?.tags) return 'N/A';
                return params.data.tags.join(', ');
            },
        },
        {
            headerName: 'Duration (Mins)',
            field: 'durationInMinutes',
            minWidth: 150,
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Marks',
            field: 'totalMarks',
            minWidth: 100,
            valueFormatter: (params) => params.value ?? 'N/A',
        },
        {
            headerName: 'Questions',
            minWidth: 100,
            valueFormatter: (params) => String(params.data?.questions?.length || 'N/A'),
        },
        {
            headerName: 'Visibility',
            field: 'isPublic',
            minWidth: 120,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return 'N/A';
                const isPublic = params.data.isPublic;
                return (
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${isPublic
                        ? 'text-primary-main bg-primary-main/15'
                        : 'bg-secondary-main/20 text-secondary-dark'
                        }`}>
                        {isPublic ? 'Public' : 'Private'}
                    </span>
                );
            },
        },
        {
            headerName: 'Status',
            field: 'isActive',
            minWidth: 120,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data) return 'N/A';
                const isActive = params.data.isActive;
                return (
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${isActive
                        ? 'bg-success-light/40 text-success-dark'
                        : 'bg-error-light/40 text-error-dark'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            headerName: 'Created On',
            field: 'createdAt',
            minWidth: 150,
            valueGetter: (params) => {  // ← ADD THIS
                if (!params.data?.createdAt) return 'N/A';
                return moment(params.data.createdAt).format('DD MMM, YYYY');
            },
        },
        {
            headerName: 'Actions',
            maxWidth: 120,
            filter: false,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<AssessmentInterface>) => {
                if (!params.data?.id) return 'N/A';
                const id = params.data.id;
                return <ActionCell
                    onEdit={() => navigate(`/admin/assessments/edit/${id}`)}
                />
            },
        },
    ], [navigate]);

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

                {isLoading ? (
                    <DataLoader />
                ) : (
                    <>
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
                    </>
                )}
            </PageBody>
        </Page>
    );
};

export default AdminAssessments;
