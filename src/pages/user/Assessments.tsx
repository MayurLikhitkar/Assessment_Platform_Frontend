import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Schedule, PlayArrow, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DataLoader from '../../components/common/DataLoader';
import { getAssessments } from '../../services/axios/assessmentApi';
import type { UserAssessmentInterface } from '../../types/types';

const Assessments: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch user assessments
    const { data: assessments, isLoading } = useQuery({
        queryKey: ['userAssessments'],
        queryFn: () => getAssessments(),
        enabled: !!user,
    });
    console.log(assessments)
    const upcomingAssessments: UserAssessmentInterface[] = assessments?.data?.filter(
        (a) => a.status === 'assigned' || a.status === 'in-progress'
    ) || [];

    const completedAssessments: UserAssessmentInterface[] = assessments?.data?.filter(
        (a) => a.status === 'completed'
    ) || [];

    if (isLoading) {
        return (
            <div className="py-8">
                <DataLoader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary">
                    My Assessments
                </h1>
                <p className="text-text-secondary mt-1">
                    Manage and take your assigned assessments
                </p>
            </div>

            {/* Upcoming Assessments */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">
                        Upcoming Assessments
                    </h2>
                    <span className="px-3 py-1 rounded-full text-sm bg-action-hover text-text-primary">
                        {upcomingAssessments?.length || 0} assigned
                    </span>
                </div>

                {upcomingAssessments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingAssessments.map((assessment: UserAssessmentInterface) => (
                            <div key={assessment.userAssessmentId} className="bg-background-light rounded-lg shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                                <div className="p-4 space-y-4 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-text-primary">
                                            {assessment.assessment.title}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${assessment.status === 'in-progress'
                                                ? 'bg-warning-light text-warning-dark'
                                                : 'bg-info-light text-info-dark'
                                                }
                                            `}
                                        >
                                            {assessment.status.replace('-', ' ')}
                                        </span>
                                    </div>

                                    <p className="text-sm text-text-inverse line-clamp-2">
                                        {assessment.assessment.description}
                                    </p>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-inverse">Duration:</span>
                                            <span className="font-medium text-text-main">
                                                {assessment.assessment.duration} mins
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-inverse">Questions:</span>
                                            <span className="font-medium text-text-primary">
                                                {assessment.assessment.questions?.length || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Total Marks:</span>
                                            <span className="font-medium text-text-primary">
                                                {assessment.assessment.totalMarks}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full mt-4 py-2 px-4 rounded bg-primary-main text-white hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 font-medium"
                                        onClick={() => navigate(`/assessment/${assessment.assessmentId}/take`)}
                                    >
                                        {assessment.status === 'in-progress' ? <PlayArrow fontSize="small" /> : <Schedule fontSize="small" />}
                                        {assessment.status === 'in-progress'
                                            ? 'Continue Assessment'
                                            : 'Start Assessment'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded bg-info-light text-info-dark border border-info-main/20">
                        No upcoming assessments assigned. Check back later or contact your administrator.
                    </div>
                )}
            </div>

            {/* Completed Assessments */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">
                        Completed Assessments
                    </h2>
                    <span className="px-3 py-1 rounded-full text-sm bg-success-light text-success-dark">
                        {completedAssessments?.length || 0} completed
                    </span>
                </div>

                {completedAssessments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedAssessments.slice(0, 6).map((assessment: UserAssessmentInterface) => (
                            <div key={assessment.userAssessmentId} className="bg-background-paper rounded-lg shadow-md h-full flex flex-col">
                                <div className="p-4 space-y-4 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-text-primary">
                                            {assessment.assessment.title}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${assessment.isPassed
                                                ? 'bg-success-light text-success-dark'
                                                : 'bg-error-light text-error-dark'
                                                }
                                            `}
                                        >
                                            {assessment.isPassed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Score:</span>
                                            <span className="font-medium text-text-primary">
                                                {assessment.score || 0}/{assessment.totalMarks}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Completed:</span>
                                            <span className="font-medium text-text-primary">
                                                {new Date(assessment.completedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-secondary">Time Spent:</span>
                                            <span className="font-medium text-text-primary">
                                                {Math.floor(assessment.timeSpent / 60)}m {assessment.timeSpent % 60}s
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full mt-4 py-2 px-4 rounded border border-primary-main text-primary-main hover:bg-primary-light/10 transition-colors flex items-center justify-center gap-2 font-medium"
                                        onClick={() => navigate(`/results/${assessment.userAssessmentId}`)}
                                    >
                                        <Visibility fontSize="small" />
                                        View Results
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded bg-info-light text-info-dark border border-info-main/20">
                        No completed assessments yet.
                    </div>
                )}

                {completedAssessments.length > 6 && (
                    <div className="text-center mt-4">
                        <button
                            className="text-primary-main hover:underline font-medium"
                            onClick={() => {
                                // Navigate to full history page
                            }}
                        >
                            View All ({completedAssessments.length})
                        </button>
                    </div>
                )}
            </div>

            {/* <CodeEditor language='' value='' onChange={() => console.log('first')} /> */}
        </div>
    );
};

export default Assessments;