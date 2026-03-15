import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    MdAssignment,
    MdCheckCircle,
    MdPending,
    MdSchedule,
    MdTrendingUp,
} from 'react-icons/md';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/axios/api';
import DataLoader from '../../../components/common/DataLoader';
import type { UserAssessmentInterface } from '../../../types/types';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    // Fetch user assessments
    const { data: assessmentsResponse, isLoading } = useQuery({
        queryKey: ['userAssessments'],
        queryFn: () => api.get(`/assessments/user/${user?.id}`),
        enabled: !!user,
    });

    // Fetch stats
    const { data: statsResponse } = useQuery({
        queryKey: ['userStats'],
        queryFn: () => api.get(`/users/${user?.id}/stats`),
        enabled: !!user,
    });

    // Type assertion for the data payload
    const assessments = (assessmentsResponse?.data as unknown as { data: UserAssessmentInterface[] })?.data || [];
    const stats = (statsResponse?.data as unknown as { data: any })?.data;

    const upcomingAssessments = assessments?.filter(
        (a: UserAssessmentInterface) => a.status === 'assigned' || a.status === 'in-progress'
    );

    const completedAssessments = assessments?.filter(
        (a: UserAssessmentInterface) => a.status === 'completed'
    );

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-dark">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="text-text-light mt-2">
                    Here's what's happening with your assessments today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-secondary-light/20 rounded-lg text-secondary-main">
                            <MdAssignment className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-dark">
                                {assessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-light">
                                Total
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-success-light/30 rounded-lg text-success-main">
                            <MdCheckCircle className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-dark">
                                {completedAssessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-light">
                                Completed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-warn-light/30 rounded-lg text-warn-main">
                            <MdPending className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-dark">
                                {upcomingAssessments?.length || 0}
                            </h3>
                            <p className="text-sm text-text-light">
                                Pending
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <div className="mr-4 p-3 bg-secondary-light/20 rounded-lg text-secondary-main">
                            <MdTrendingUp className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-dark">
                                {stats?.averageScore || '0'}%
                            </h3>
                            <p className="text-sm text-text-light">
                                Avg. Score
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Assessments */}
            <div className="bg-background-light rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-dark">
                        Upcoming Assessments
                    </h2>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted-light text-text-dark">
                        {upcomingAssessments?.length || 0} total
                    </span>
                </div>

                {isLoading ? (
                    <DataLoader />
                ) : upcomingAssessments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {upcomingAssessments.slice(0, 3).map((assessment: UserAssessmentInterface) => (
                            <div key={assessment.userAssessmentId} className="bg-background-light border border-border-light rounded-lg hover:shadow-md transition-shadow overflow-hidden">
                                <div className="p-4 cursor-pointer hover:bg-muted-light/50 transition-colors h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-bold text-text-dark">
                                            {assessment.assessment?.title || 'Unknown Title'}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted-light text-text-light border border-border-light capitalize">
                                            {assessment.assessment?.difficulty || 'Unknown'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-light mb-4 line-clamp-1">
                                        {assessment.assessment?.description || 'No description available.'}
                                    </p>
                                    <div className="flex justify-between items-center text-sm text-text-light">
                                        <div className="flex items-center">
                                            <MdSchedule className="mr-1" />
                                            {assessment.assessment?.durationInMinutes || 0} mins
                                        </div>
                                        <div>
                                            {assessment.assessment?.totalMarks || 0} marks
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MdAssignment className="text-muted-dark text-4xl mb-4 mx-auto" />
                        <p className="text-text-light">
                            No upcoming assessments
                        </p>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-background-light rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-text-dark mb-4">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {assessments?.slice(0, 5).map((assessment: UserAssessmentInterface) => (
                        <div
                            key={assessment.userAssessmentId}
                            className="flex items-center justify-between p-4 border border-border-light rounded-lg hover:bg-muted-light/50 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-text-dark">
                                    {assessment.assessment?.title || 'Unknown Title'}
                                </p>
                                <p className="text-sm text-text-light">
                                    Completed on {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'Unknown'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-text-dark">
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