import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Grid,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Card,
    CardContent,
    CardActionArea,
} from '@mui/material';
import {
    Assessment as AssessmentIcon,
    CheckCircle,
    Pending,
    Schedule,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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
                <Typography variant="h4" className="font-bold text-gray-900">
                    Welcome back, {user?.fullName}!
                </Typography>
                <Typography variant="body1" className="text-gray-600 mt-2">
                    Here's what's happening with your assessments today.
                </Typography>
            </div>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent className="flex items-center">
                            <div className="mr-4 p-3 bg-blue-50 rounded-lg">
                                <AssessmentIcon className="text-blue-600" />
                            </div>
                            <div>
                                <Typography variant="h6" className="font-bold">
                                    {assessments?.length || 0}
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Total Assessments
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent className="flex items-center">
                            <div className="mr-4 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="text-green-600" />
                            </div>
                            <div>
                                <Typography variant="h6" className="font-bold">
                                    {completedAssessments?.length || 0}
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Completed
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent className="flex items-center">
                            <div className="mr-4 p-3 bg-yellow-50 rounded-lg">
                                <Pending className="text-yellow-600" />
                            </div>
                            <div>
                                <Typography variant="h6" className="font-bold">
                                    {upcomingAssessments?.length || 0}
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Pending
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent className="flex items-center">
                            <div className="mr-4 p-3 bg-purple-50 rounded-lg">
                                <TrendingUp className="text-purple-600" />
                            </div>
                            <div>
                                <Typography variant="h6" className="font-bold">
                                    {stats?.averageScore || '0'}%
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Avg. Score
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Upcoming Assessments */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <Typography variant="h6" className="font-bold">
                        Upcoming Assessments
                    </Typography>
                    <Chip
                        label={`${upcomingAssessments?.length || 0} total`}
                        color="primary"
                        size="small"
                    />
                </div>

                {isLoading ? (
                    <LinearProgress />
                ) : upcomingAssessments?.length > 0 ? (
                    <Grid container spacing={3}>
                        {upcomingAssessments.slice(0, 3).map((assessment: any) => (
                            <Grid size={{ xs: 12, md: 4 }} key={assessment.id}>
                                <Card>
                                    <CardActionArea>
                                        <CardContent>
                                            <div className="flex justify-between items-start mb-4">
                                                <Typography variant="h6" className="font-bold">
                                                    {assessment.title}
                                                </Typography>
                                                <Chip
                                                    label={assessment.difficulty}
                                                    size="small"
                                                    color={
                                                        assessment.difficulty === 'easy'
                                                            ? 'success'
                                                            : assessment.difficulty === 'medium'
                                                                ? 'warning'
                                                                : 'error'
                                                    }
                                                />
                                            </div>
                                            <Typography
                                                variant="body2"
                                                className="text-gray-600 mb-4"
                                                noWrap
                                            >
                                                {assessment.description}
                                            </Typography>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Schedule className="mr-1" fontSize="small" />
                                                    {assessment.duration} mins
                                                </div>
                                                <div>
                                                    {assessment.totalMarks} marks
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box className="text-center py-8">
                        <AssessmentIcon className="text-gray-400 text-4xl mb-4" />
                        <Typography variant="body1" className="text-gray-500">
                            No upcoming assessments
                        </Typography>
                    </Box>
                )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <Typography variant="h6" className="font-bold mb-4">
                    Recent Activity
                </Typography>
                <div className="space-y-4">
                    {assessments?.slice(0, 5).map((assessment: any) => (
                        <div
                            key={assessment.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div>
                                <Typography variant="body1" className="font-medium">
                                    {assessment.title}
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                    Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                                </Typography>
                            </div>
                            <div className="text-right">
                                <Typography variant="h6" className="font-bold">
                                    {assessment.score || '--'}/{assessment.totalMarks}
                                </Typography>
                                <Chip
                                    label={assessment.isPassed ? 'Passed' : 'Failed'}
                                    size="small"
                                    color={assessment.isPassed ? 'success' : 'error'}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;