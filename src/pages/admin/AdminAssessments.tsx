import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdAccessTime, MdAssignment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import DataLoader from '../../components/common/DataLoader';
import { getAdminAssessments } from '../../services/axios/adminApi';
import type { AssessmentInterface } from '../../types/types';

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
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                    onClick={() => navigate('/admin/assessments/create')}
                >
                    <MdAdd className="text-xl" />
                    Create Assessment
                </button>
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
                    <input
                        type="text"
                        placeholder="Search assessments by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-border-light rounded-lg bg-background-main text-text-main placeholder-text-light/70 focus:outline-none focus:ring-2 focus:ring-primary-light/30 focus:border-primary-light transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        <DataLoader />
                    </div>
                ) : filteredAssessments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted-light/50 border-b border-border-light">
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Title</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Difficulty</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Duration</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Marks</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Questions</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-text-light uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light/50">
                                {filteredAssessments.map((assessment: AssessmentInterface) => (
                                    <tr key={assessment.assessmentId} className="hover:bg-muted-light/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-text-dark text-sm">{assessment.title}</p>
                                                <p className="text-xs text-text-light mt-0.5 line-clamp-1 max-w-[250px]">{assessment.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {assessment.type.map((t) => (
                                                    <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${typeColors[t] || 'bg-muted-light text-text-light'}`}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${difficultyColors[assessment.difficulty] || 'bg-muted-light text-text-light'}`}>
                                                {assessment.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-text-main">
                                                <MdAccessTime className="text-text-light" />
                                                {assessment.duration} min
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-text-dark">
                                            {assessment.totalMarks}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-main">
                                            {assessment.questions?.length || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${assessment.isActive
                                                ? 'bg-success-light/40 text-success-dark'
                                                : 'bg-error-light/40 text-error-dark'
                                                }`}>
                                                {assessment.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MdAssignment className="text-5xl text-muted-dark mx-auto mb-3" />
                        <p className="text-text-light font-medium">
                            {searchQuery ? 'No assessments match your search' : 'No assessments found'}
                        </p>
                        <p className="text-sm text-text-light mt-1">
                            {searchQuery ? 'Try a different search term' : 'Create your first assessment to get started'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAssessments;
