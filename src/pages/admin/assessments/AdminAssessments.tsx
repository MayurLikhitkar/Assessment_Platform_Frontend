import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdAccessTime, MdAssignment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { getAdminAssessments } from '../../../services/axios/adminApi';
import type { AssessmentInterface } from '../../../types/types';

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
    const [searchQuery, setSearchQuery] = useState('');

    const { data: assessmentsData, isLoading } = useQuery({
        queryKey: ['adminAssessments'],
        queryFn: getAdminAssessments,
    });

    const assessments = assessmentsData?.data || [];

    const filteredAssessments = assessments.filter((a: AssessmentInterface) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = assessments.filter((a: AssessmentInterface) => a.isActive).length;
    const inactiveCount = assessments.filter((a: AssessmentInterface) => !a.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">Assessments</h1>
                    <p className="text-text-light mt-1">Manage all assessments on the platform</p>
                </div>
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

            {/* Search */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-4">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-xl" />
                    <Input
                        type="text"
                        placeholder="Search assessments by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                <Table<AssessmentInterface>
                    data={filteredAssessments}
                    isLoading={isLoading}
                    keyExtractor={(a) => a.assessmentId}
                    emptyStateMessage={searchQuery ? 'No assessments match your search' : 'No assessments found'}
                    emptyStateSubMessage={searchQuery ? 'Try a different search term' : 'Create your first assessment to get started'}
                    emptyStateIcon={<MdAssignment className="text-5xl text-muted-dark mx-auto mb-3" />}
                    columns={[
                        {
                            header: 'Title',
                            accessorKey: 'title',
                            render: (a) => (
                                <div>
                                    <p className="font-medium text-text-dark text-sm">{a.title}</p>
                                    <p className="text-xs text-text-light mt-0.5 line-clamp-1 max-w-[250px]">{a.description}</p>
                                </div>
                            )
                        },
                        {
                            header: 'Type',
                            accessorKey: 'type',
                            render: (a) => (
                                <div className="flex flex-wrap gap-1">
                                    {a.type.map((t) => (
                                        <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${typeColors[t] || 'bg-muted-light text-text-light'}`}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )
                        },
                        {
                            header: 'Difficulty',
                            accessorKey: 'difficulty',
                            render: (a) => (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[a.difficulty] || 'bg-muted-light text-text-light'}`}>
                                    {a.difficulty}
                                </span>
                            )
                        },
                        {
                            header: 'Duration',
                            accessorKey: 'duration',
                            render: (a) => (
                                <div className="flex items-center gap-1 text-sm text-text-main">
                                    <MdAccessTime className="text-text-light" />
                                    {a.duration} min
                                </div>
                            )
                        },
                        {
                            header: 'Marks',
                            accessorKey: 'totalMarks',
                            render: (a) => (
                                <span className="text-sm font-medium text-text-dark">{a.totalMarks}</span>
                            )
                        },
                        {
                            header: 'Questions',
                            render: (a) => (
                                <span className="text-sm text-text-main">{a.questions?.length || 0}</span>
                            )
                        },
                        {
                            header: 'Status',
                            accessorKey: 'isActive',
                            render: (a) => (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.isActive
                                    ? 'bg-success-light/40 text-success-dark'
                                    : 'bg-error-light/40 text-error-dark'
                                    }`}>
                                    {a.isActive ? 'Active' : 'Inactive'}
                                </span>
                            )
                        },
                        {
                            header: 'Actions',
                            render: () => (
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-1.5 rounded-lg hover:bg-secondary-light/20 text-secondary-main transition-colors"
                                        title="View Details"
                                    >
                                        <MdVisibility className="text-lg" />
                                    </button>
                                    <button
                                        className="p-1.5 rounded-lg hover:bg-primary-light/10 text-primary-main transition-colors"
                                        title="Edit"
                                    >
                                        <MdEdit className="text-lg" />
                                    </button>
                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default AdminAssessments;
