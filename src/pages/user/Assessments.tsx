import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    Schedule,
    PlayArrow,
    Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/axios/api';

const Assessments: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch user assessments
    const { data: assessments, isLoading } = useQuery<any[]>({
        queryKey: ['userAssessments'],
        queryFn: () => api.get(`/assessments/user/${user?.id}`),
        enabled: !!user,
    });

    const upcomingAssessments = assessments?.filter(
        (a: any) => a.status === 'assigned' || a.status === 'in-progress'
    ) || [];

    const completedAssessments = assessments?.filter(
        (a: any) => a.status === 'completed'
    ) || [];

    if (isLoading) {
        return (
            <Box className="flex justify-center py-8">
                <LinearProgress className="w-64" />
            </Box>
        );
    }

    return (
        <Box className="space-y-6">
            {/* Header */}
            <Box>
                <Typography variant="h4" className="font-bold">
                    My Assessments
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Manage and take your assigned assessments
                </Typography>
            </Box>

            {/* Upcoming Assessments */}
            <Box>
                <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="font-bold">
                        Upcoming Assessments
                    </Typography>
                    <Chip
                        label={`${upcomingAssessments?.length || 0} assigned`}
                        color="primary"
                    />
                </Box>

                {upcomingAssessments.length > 0 ? (
                    <Grid container spacing={3}>
                        {upcomingAssessments.map((assessment: any) => (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={assessment.userAssessmentId}>
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <CardContent className="space-y-4">
                                        <Box className="flex justify-between items-start">
                                            <Typography variant="h6" className="font-bold">
                                                {assessment.assessment.title}
                                            </Typography>
                                            <Chip
                                                label={assessment.status.replace('-', ' ')}
                                                size="small"
                                                color={
                                                    assessment.status === 'in-progress' ? 'warning' : 'info'
                                                }
                                            />
                                        </Box>

                                        <Typography variant="body2" color="textSecondary" noWrap>
                                            {assessment.assessment.description}
                                        </Typography>

                                        <Box className="space-y-2">
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Duration:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {assessment.assessment.duration} mins
                                                </Typography>
                                            </Box>
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Questions:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {assessment.assessment.questions?.length || 0}
                                                </Typography>
                                            </Box>
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Total Marks:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {assessment.assessment.totalMarks}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={
                                                assessment.status === 'in-progress' ? (
                                                    <PlayArrow />
                                                ) : (
                                                    <Schedule />
                                                )
                                            }
                                            onClick={() => navigate(`/assessment/${assessment.assessmentId}/take`)}
                                        >
                                            {assessment.status === 'in-progress'
                                                ? 'Continue Assessment'
                                                : 'Start Assessment'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info">
                        No upcoming assessments assigned. Check back later or contact your administrator.
                    </Alert>
                )}
            </Box>

            {/* Completed Assessments */}
            <Box>
                <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6" className="font-bold">
                        Completed Assessments
                    </Typography>
                    <Chip
                        label={`${completedAssessments?.length || 0} completed`}
                        color="success"
                    />
                </Box>

                {completedAssessments.length > 0 ? (
                    <Grid container spacing={3}>
                        {completedAssessments.slice(0, 6).map((assessment: any) => (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={assessment.userAssessmentId}>
                                <Card className="h-full">
                                    <CardContent className="space-y-4">
                                        <Box className="flex justify-between items-start">
                                            <Typography variant="h6" className="font-bold">
                                                {assessment.assessment.title}
                                            </Typography>
                                            <Chip
                                                label={assessment.isPassed ? 'Passed' : 'Failed'}
                                                color={assessment.isPassed ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Box>

                                        <Box className="space-y-2">
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Score:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {assessment.score || 0}/{assessment.totalMarks}
                                                </Typography>
                                            </Box>
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Completed:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {new Date(assessment.completedAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Box className="flex justify-between">
                                                <Typography variant="caption" color="textSecondary">
                                                    Time Spent:
                                                </Typography>
                                                <Typography variant="caption" className="font-medium">
                                                    {Math.floor(assessment.timeSpent / 60)}m {assessment.timeSpent % 60}s
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<Visibility />}
                                            onClick={() => navigate(`/results/${assessment.userAssessmentId}`)}
                                        >
                                            View Results
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Alert severity="info">No completed assessments yet.</Alert>
                )}

                {completedAssessments.length > 6 && (
                    <Box className="text-center mt-4">
                        <Button
                            variant="text"
                            onClick={() => {
                                // Navigate to full history page
                            }}
                        >
                            View All ({completedAssessments.length})
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default Assessments;