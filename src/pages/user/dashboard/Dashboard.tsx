import React from 'react';
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import {
    MdArrowForward,
    MdAssignment,
    MdPending,
    MdSchedule,
    MdTrendingUp,
} from 'react-icons/md';
import { LuLayoutDashboard } from "react-icons/lu";
import { useAuth } from '../../../hooks/useAuth';
import DataLoader from '../../../components/common/DataLoader';
import { ContentBox, Page, PageBody, PageTitle } from '../../../components/ui/Page';
import { useNavigate } from 'react-router-dom';
import { getAssessments } from '../../../services/axios/userApi';
import type { AssessmentInterface } from '../../../types/assessmentTypes';
import moment from 'moment';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // // Fetch user assessments
    // const { data: assessmentsResponse, isLoading } = useQuery({
    //     queryKey: ['userAssessments'],
    //     queryFn: () => api.get(`/assessments/user/${user?.id}`),
    //     enabled: !!user,
    // });

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['upcomingAssessments'],
        queryFn: () => getAssessments({ startDate: new Date() }),
        enabled: !!user,
    });
    const upcomingAssessments = assessmentData?.data || [];

    const statCards = [
        {
            label: 'Assessments Assigned',
            value: 0,
            icon: <MdAssignment className="text-2xl" />,
            bgColor: 'bg-primary-light/20',
            iconColor: 'text-primary-main',
            link: '/admin/assessments',
        },
        {
            label: 'Assessments Completed',
            value: 0,
            icon: <MdAssignment className="text-2xl" />,
            bgColor: 'bg-primary-light/20',
            iconColor: 'text-primary-main',
            link: '/admin/assessments',
        },
        {
            label: 'Active Now',
            value: '—',
            icon: <MdPending className="text-2xl" />,
            bgColor: 'bg-success-light/30',
            iconColor: 'text-success-main',
            link: '#',
        },
        {
            label: 'Avg. Score',
            value: '—',
            icon: <MdTrendingUp className="text-2xl" />,
            bgColor: 'bg-accent-light/20',
            iconColor: 'text-accent-main',
            link: '#',
        },
    ];

    return (
        <Page>
            <PageBody className='py-5'>
                {/* Welcome Header */}
                <div className="flex items-center justify-between">
                    <PageTitle title="Dashboard" icon={LuLayoutDashboard} description={`Welcome back, ${user?.fullName}. Here's what's happening today.`} />
                    <div className="text-right hidden sm:block text-sm">
                        <p className="font-semibold text-secondary-main">
                            {moment().format('dddd, MMMM D')}
                        </p>
                        <p className="text-text-main">
                            {moment().format('hh:mm A')}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                {isLoading ? (
                    <DataLoader />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card, index) => (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}>
                                <ContentBox
                                    className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-5 hover:shadow-md transition-shadow cursor-pointer group text-left w-full h-full"
                                    onClick={() => card.link !== '#' && navigate(card.link)}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-text-light">{card.label}</p>
                                            <h3 className="text-2xl font-bold text-text-dark mt-1">
                                                {card.value}
                                            </h3>
                                        </div>
                                        <div className={`p-3 rounded-xl ${card.bgColor} ${card.iconColor}`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                    {card.link !== '#' && (
                                        <div className="mt-3 flex items-center text-xs text-primary-main font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            View details <MdArrowForward className="ml-1 text-sm" />
                                        </div>
                                    )}
                                </ContentBox>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Upcoming Assessments */}
                <ContentBox>
                    <h2 className="text-xl font-bold">
                        Upcoming Assessments
                    </h2>

                    {isLoading ? (
                        <DataLoader />
                    ) : upcomingAssessments?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {upcomingAssessments.slice(0, 3).map((assessment: AssessmentInterface) => (
                                <div key={assessment.id} className="bg-background-light border border-border-light rounded-lg hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="p-4 cursor-pointer hover:bg-muted-light/50 transition-colors h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-text-dark">
                                                {assessment.title || 'Unknown Title'}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted-light text-text-light border border-border-light capitalize">
                                                {assessment.difficulty || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-light mb-4 line-clamp-1">
                                            {assessment.description || 'No description available.'}
                                        </p>
                                        <div className="flex justify-between items-center text-sm text-text-light">
                                            <div className="flex items-center">
                                                <MdSchedule className="mr-1" />
                                                {assessment.durationInMinutes || 0} mins
                                            </div>
                                            <div>
                                                {assessment.totalMarks || 0} marks
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
                </ContentBox>

                {/* Recent Activity */}
                {/* <div className="bg-background-light rounded-xl shadow-sm p-6">
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
            </div> */}
            </PageBody>
        </Page>
    );
};

export default Dashboard;