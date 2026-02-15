import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Assessment as AssessmentIcon,
    CheckCircle,
    Pending,
    Schedule,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/axios/api';
import { LinearProgress } from '@mui/material';
import DataLoader from '../../components/common/DataLoader';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Fetch user assessments
    const { data: assessments, isLoading } = useQuery({
        queryKey: ['userAssessments'],
        queryFn: () => api.get(`/assessments/user/${user?.id}`),
        enabled: !!user,
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['userStats'],
        queryFn: () => api.get(`/users/${user?.id}/stats`),
        enabled: !!user,
    });

    const upcomingAssessments = assessments?.filter(
        (a: any) => a.status === 'assigned' || a.status === 'in-progress'
    );

    const completedAssessments = assessments?.filter(
        (a: any) => a.status === 'completed'
    );

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="text-text-secondary mt-2">
                    Here's what's happening with your assessments today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-info-light rounded-lg text-info-main">
                            <AssessmentIcon />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">
                                {assessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Total
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-success-light rounded-lg text-success-main">
                            <CheckCircle />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">
                                {completedAssessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Completed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-warning-light rounded-lg text-warning-main">
                            <Pending />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">
                                {upcomingAssessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Pending
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-secondary-light rounded-lg text-secondary-main">
                            <TrendingUp />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">
                                {stats?.averageScore || '0'}%
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Avg. Score
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Assessments */}
            <div className="bg-background-light rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary">
                        Upcoming Assessments
                    </h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-action-hover text-text-primary">
                        {upcomingAssessments?.length || 0} total
                    </span>
                </div>

                {isLoading ? (
                    <DataLoader />
                ) : upcomingAssessments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {upcomingAssessments.slice(0, 3).map((assessment: any) => (
                            <div key={assessment.id} className="bg-background-light border border-divider rounded-lg hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-4 cursor-pointer hover:bg-action-hover transition-colors h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-text-primary">
                                            {assessment.title}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background-default text-text-secondary border border-divider">
                                            {assessment.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary mb-4 line-clamp-1">
                                        {assessment.description}
                                    </p>
                                    <div className="flex justify-between items-center text-sm text-text-secondary">
                                        <div className="flex items-center">
                                            <Schedule className="mr-1" fontSize="small" />
                                            {assessment.duration} mins
                                        </div>
                                        <div>
                                            {assessment.totalMarks} marks
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AssessmentIcon className="text-text-disabled text-4xl mb-4" />
                        <p className="text-text-secondary">
                            No upcoming assessments
                        </p>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-background-light rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {assessments?.slice(0, 5).map((assessment: any) => (
                        <div
                            key={assessment.id}
                            className="flex items-center justify-between p-4 border border-divider rounded-lg hover:bg-action-hover transition-colors"
                        >
                            <div>
                                <p className="font-medium text-text-primary">
                                    {assessment.title}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-text-primary">
                                    {assessment.score || '--'}/{assessment.totalMarks}
                                </p>
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${assessment.isPassed
                                        ? 'bg-success-light text-success-dark'
                                        : 'bg-error-light text-error-dark'
                                        }`}
                                >
                                    {assessment.isPassed ? 'Passed' : 'Failed'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;