import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    MdPeople,
    MdAssignment,
    MdTrendingUp,
    MdPersonAdd,
    MdArrowForward,
} from 'react-icons/md';
import { useAuth } from '../../../hooks/useAuth';
import DataLoader from '../../../components/common/DataLoader';
import { getAdminStats } from '../../../services/axios/adminApi';
import { ContentBox, Page, PageBody, PageTitle } from '../../../components/ui/Page';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
        enabled: !!user,
    });

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalUsers ?? 0,
            icon: <MdPeople className="text-2xl" />,
            bgColor: 'bg-secondary-light/20',
            iconColor: 'text-secondary-main',
            link: '/admin/users',
        },
        {
            label: 'Assessments',
            value: stats?.totalAssessments ?? 0,
            icon: <MdAssignment className="text-2xl" />,
            bgColor: 'bg-primary-light/20',
            iconColor: 'text-primary-main',
            link: '/admin/assessments',
        },
        {
            label: 'Active Now',
            value: '—',
            icon: <MdTrendingUp className="text-2xl" />,
            bgColor: 'bg-success-light/30',
            iconColor: 'text-success-main',
            link: '#',
        },
        {
            label: 'New This Week',
            value: '—',
            icon: <MdPersonAdd className="text-2xl" />,
            bgColor: 'bg-accent-light/20',
            iconColor: 'text-accent-main',
            link: '#',
        },
    ];

    const quickActions = [
        { label: 'Manage Users', description: 'View, edit, and manage user accounts', path: '/admin/users', icon: <MdPeople className="text-2xl" /> },
        { label: 'Manage Assessments', description: 'Create and manage assessments', path: '/admin/assessments', icon: <MdAssignment className="text-2xl" /> },
    ];

    return (
        <Page>
            <PageBody className='py-7'>
                <PageTitle title={`Welcome back, ${user?.fullName}`} description="Here's your platform overview." />

                {/* Stats Cards */}
                {isLoading ? (
                    <DataLoader />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((card) => (
                            <button
                                key={card.label}
                                className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-5 hover:shadow-md transition-shadow cursor-pointer group text-left w-full"
                                onClick={() => card.link !== '#' && navigate(card.link)}
                            >
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
                            </button>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-bold text-text-dark mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <ContentBox
                                key={action.path}
                                onClick={() => navigate(action.path)}
                                className="flex items-center gap-4 p-5 hover:border-primary-light/40 hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="p-3 rounded-xl bg-primary-light/10 text-primary-main group-hover:bg-primary-main group-hover:text-white transition-colors">
                                    {action.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-text-dark">{action.label}</h3>
                                    <p className="text-sm text-text-light mt-0.5">{action.description}</p>
                                </div>
                                <MdArrowForward className="text-text-light group-hover:text-primary-main transition-colors" />
                            </ContentBox>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6">
                    <h2 className="text-xl font-bold text-text-dark mb-4">Recent Activity</h2>
                    <div className="text-center py-10">
                        <MdTrendingUp className="text-muted-dark text-5xl mb-3" />
                        <p className="text-text-light">Activity tracking coming soon</p>
                        <p className="text-sm text-text-light mt-1">Recent user actions and system events will appear here.</p>
                    </div>
                </div>
            </PageBody>
        </Page>
    );
};

export default AdminDashboard;

