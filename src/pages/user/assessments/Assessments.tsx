import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdVisibility, MdAssignment, MdAccessTimeFilled, MdQuiz } from 'react-icons/md';
import { FaSquareCheck, FaMicrophone, FaCalendarDay, FaLock, FaCaretRight } from "react-icons/fa6";
import { IoVideocam } from "react-icons/io5";
import { TbBrowserX } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import DataLoader from '../../../components/common/DataLoader';
import { getAssessments } from '../../../services/axios/userApi';
import Button from '../../../components/ui/Button';
import { ContentBox, Page, PageBody, PageTitle } from '../../../components/ui/Page';
import { type AssessmentInterface } from '../../../types/assessmentTypes';
import moment from 'moment';
import type { UserAssessmentInterface } from '../../../types/userAssessmentTypes';

const completedAssessments: UserAssessmentInterface[] = [
    {
        _id: "64f1a2b3c4d5e6f7a8b9c0d1",
        id: 1001,
        userId: "user_a1b2c3d4e5f6",
        assessmentId: 201,
        status: "completed",
        startedAt: new Date("2025-05-10T09:00:00Z"),
        completedAt: new Date("2025-05-10T10:25:00Z"),
        timeSpent: 5100, // in seconds
        score: 85,
        totalMarks: 100,
        answers: [
            { questionId: 1, selectedOption: "B", isCorrect: true },
            { questionId: 2, selectedOption: "A", isCorrect: false },
            { questionId: 3, selectedOption: "D", isCorrect: true },
        ],
        recordingUrl: "https://storage.example.com/recordings/session_1001.mp4",
        tabSwitches: 2,
        fullscreenExits: 1,
        violations: [
            {
                type: "tab_switch",
                timestamp: new Date("2025-05-10T09:30:00Z"),
                details: "User switched to another browser tab",
            },
            {
                type: "fullscreen_exit",
                timestamp: new Date("2025-05-10T10:00:00Z"),
                details: "User exited fullscreen mode",
            },
        ],
        evaluatedBy: "evaluator_xyz123",
        evaluationDate: new Date("2025-05-11T14:00:00Z"),
        feedback: "Good performance overall. Needs improvement in section 2.",
        isPassed: true,
        createdBy: "admin_001",
        updatedBy: "evaluator_xyz123",
        createdAt: new Date("2025-05-09T08:00:00Z"),
        updatedAt: new Date("2025-05-11T14:00:00Z"),
    },
    {
        _id: "64f1a2b3c4d5e6f7a8b9c0d2",
        id: 1002,
        userId: "user_b2c3d4e5f6a1",
        assessmentId: 202,
        status: "in-progress",
        startedAt: new Date("2025-05-15T11:00:00Z"),
        timeSpent: 1800,
        totalMarks: 50,
        answers: [
            { questionId: 1, selectedOption: "C", isCorrect: true },
            { questionId: 2, selectedOption: "A", isCorrect: true },
        ],
        recordingUrl: "https://storage.example.com/recordings/session_1002.mp4",
        tabSwitches: 0,
        fullscreenExits: 0,
        violations: [],
        isPassed: false,
        createdBy: "admin_001",
        updatedBy: "admin_001",
        createdAt: new Date("2025-05-14T10:00:00Z"),
        updatedAt: new Date("2025-05-15T11:30:00Z"),
    },
    {
        _id: "64f1a2b3c4d5e6f7a8b9c0d3",
        id: 1003,
        userId: "user_c3d4e5f6a1b2",
        assessmentId: 203,
        status: "completed",
        startedAt: new Date("2025-05-12T14:00:00Z"),
        timeSpent: 900,
        score: 10,
        totalMarks: 100,
        answers: [
            { questionId: 1, selectedOption: "A", isCorrect: false },
        ],
        recordingUrl: "https://storage.example.com/recordings/session_1003.mp4",
        tabSwitches: 5,
        fullscreenExits: 3,
        violations: [
            {
                type: "tab_switch",
                timestamp: new Date("2025-05-12T14:10:00Z"),
                details: "Repeated tab switching detected",
            },
            {
                type: "multiple_faces",
                timestamp: new Date("2025-05-12T14:20:00Z"),
                details: "More than one face detected in webcam feed",
            },
            {
                type: "no_audio",
                timestamp: new Date("2025-05-12T14:25:00Z"),
                details: "Audio stream interrupted",
            },
        ],
        evaluatedBy: "evaluator_abc456",
        evaluationDate: new Date("2025-05-12T16:00:00Z"),
        feedback: "Assessment terminated due to multiple proctoring violations.",
        isPassed: false,
        createdBy: "admin_002",
        updatedBy: "evaluator_abc456",
        createdAt: new Date("2025-05-11T09:00:00Z"),
        updatedAt: new Date("2025-05-12T16:00:00Z"),
    },
    {
        _id: "64f1a2b3c4d5e6f7a8b9c0d4",
        id: 1004,
        userId: "user_d4e5f6a1b2c3",
        assessmentId: 204,
        status: "expired",
        startedAt: new Date("2025-04-01T09:00:00Z"),
        timeSpent: 0,
        totalMarks: 75,
        answers: [],
        tabSwitches: 0,
        fullscreenExits: 0,
        violations: [
            {
                type: "no_webcam",
                timestamp: new Date("2025-04-01T09:01:00Z"),
                details: "Webcam not detected at session start",
            },
        ],
        feedback: "Assessment expired without submission. Webcam issue prevented start.",
        isPassed: false,
        createdBy: "admin_003",
        updatedBy: "admin_003",
        createdAt: new Date("2025-03-28T12:00:00Z"),
        updatedAt: new Date("2025-04-01T10:00:00Z"),
    },
];

const Assessments: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch user assessments
    const { data: allAssessments, isLoading: assessmentsLoading } = useQuery({
        queryKey: ['assessments'],
        queryFn: () => getAssessments({ startDate: new Date() }),
        enabled: !!user,
    });

    const assessments = allAssessments?.data || [];

    return (
        <Page>
            <PageBody className='py-5'>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <PageTitle title="Assessments" icon={MdAssignment} />
                </div>

                {assessmentsLoading ? (
                    <DataLoader />
                ) : (
                    <div className="space-y-8">
                        {/* Modern Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <h2 className="text-2xl font-bold text-primary-light">
                                Assessments
                            </h2>
                        </div>

                        {assessments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                                {assessments?.map((assessment: AssessmentInterface) => {
                                    const proctoringFeatures = [
                                        { icon: IoVideocam, active: assessment.requireWebcam, label: 'Webcam' },
                                        { icon: FaMicrophone, active: assessment.requireMicrophone, label: 'Mic' },
                                        { icon: TbBrowserX, active: !assessment.allowTabSwitch, label: 'Tab Lock' },
                                        { icon: FaLock, active: !assessment.allowFullscreenExit, label: 'Fullscreen' },
                                    ];
                                    const features = [
                                        { icon: MdQuiz, value: assessment.questions?.length || 0, label: 'Questions' },
                                        { icon: MdAccessTimeFilled, value: assessment.durationInMinutes, label: 'Minutes' },
                                        { icon: FaSquareCheck, value: assessment.totalMarks, label: 'Marks' },
                                    ];
                                    const colorMap = {
                                        beginner: 'text-text-inverse bg-success-main',
                                        intermediate: 'text-text-inverse bg-primary-light',
                                        advanced: 'text-text-inverse bg-warn-main',
                                        expert: 'text-text-inverse bg-error-dark',
                                    };
                                    return (
                                        <ContentBox
                                            key={assessment.id}
                                            className="group flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                                            {/* Badges Row */}
                                            <div className="flex flex-wrap items-center gap-2 font-semibold text-xs">
                                                <span
                                                    className={`px-2 py-1 rounded-md capitalize ${colorMap[assessment.difficulty]}`}
                                                >
                                                    {assessment.difficulty}
                                                </span>

                                                {assessment.type?.slice(0, 2).map((type, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 rounded-md text-text-light border border-secondary-light/30 uppercase"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-secondary-dark transition-colors duration-300 truncate">
                                                {assessment.title}
                                            </h3>

                                            {/* Stat Grid */}
                                            <div className="space-y-1">
                                                {features.map((feat) => (
                                                    <div className="flex items-center gap-2" key={feat.label} title={feat.label}>
                                                        <feat.icon className="w-4 h-4 text-secondary-dark" />
                                                        <div className="font-bold text-text-main/90">{feat.value}</div>
                                                        <div className="text-xs text-text-light font-semibold">{feat.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Passing Criteria */}
                                            {/* <div className="">
                                                <div className="flex justify-between items-center text-sm mb-1">
                                                    <span className="text-text-light font-medium">Passing Score</span>
                                                    <span className="font-bold text-primary-main">
                                                        {assessment.passingMarks}{' '}
                                                        <span className="text-text-main">/ {assessment.totalMarks}</span>
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-background-dark rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full opacity-80 ${colorMap[assessment.difficulty]}`}
                                                        style={{ width: `${passingPercent}%` }}
                                                    />
                                                </div>
                                            </div> */}

                                            {/* Date Window */}
                                            {(assessment.startDate || assessment.endDate) && <div className="flex items-center gap-2 text-xs text-text-main font-medium">
                                                <FaCalendarDay className="w-4 h-4 text-secondary-dark" />
                                                {assessment.startDate && new Date(assessment.startDate) > new Date()
                                                    ? `Starts On ${moment(assessment.startDate).format('DD MMM YYYY')}`
                                                    : assessment.endDate && new Date() < new Date(assessment.endDate)
                                                        ? `Ends On ${moment(assessment.endDate).format('DD MMM YYYY')}`
                                                        : 'Closed'
                                                }
                                            </div>}

                                            {/* CTA */}
                                            <div className="flex items-center justify-between pt-3 border-t border-dark-light/20">
                                                <div className="flex items-center gap-1">
                                                    {proctoringFeatures.map((feat) => (
                                                        <div
                                                            key={feat.label}
                                                            className={`p-1 rounded ${feat.active ? 'bg-secondary-main text-text-inverse' : 'bg-background-dark text-text-light/50'}`}
                                                            title={feat.label}
                                                        >
                                                            <feat.icon className="w-3 h-3" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button className="text-secondary-main gap-1" variant='text' onClick={() => navigate(`/assessment/${assessment.id}/take`)}>
                                                    View Details
                                                    <FaCaretRight className="w-4 h-4 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                                                </Button>
                                            </div>
                                        </ContentBox>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl bg-background-light border border-muted-main/50 text-center">
                                <div className="w-16 h-16 bg-muted-light/50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-text-dark mb-1">No assessments available</h3>
                                <p className="text-sm text-text-light max-w-xs leading-relaxed">
                                    Check back later or contact your administrator to get assigned new assessments.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Completed Assessments */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-text-dark">
                            Completed Assessments
                        </h2>
                        <span className="px-3 py-1 rounded-full text-sm bg-success-light text-success-dark">
                            {assessments?.length || 0} completed
                        </span>
                    </div>

                    {completedAssessments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedAssessments.slice(0, 6).map((assessment: UserAssessmentInterface) => (
                                <div key={assessment.id} className="bg-background-light rounded-lg shadow-md h-full flex flex-col">
                                    <div className="p-4 space-y-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-text-dark">
                                                assessment.title
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
                                                <span className="text-text-light">Score:</span>
                                                <span className="font-medium text-text-dark">
                                                    {assessment.score || 0}/{assessment.totalMarks}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-light">Completed:</span>
                                                <span className="font-medium text-text-dark">
                                                    {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-light">Time Spent:</span>
                                                <span className="font-medium text-text-dark">
                                                    {assessment.timeSpent ? `${Math.floor(assessment.timeSpent / 60)}m ${assessment.timeSpent % 60}s` : '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="w-full mt-4 flex items-center justify-center gap-2"
                                            onClick={() => navigate(`/results/${assessment.id}`)}
                                        >
                                            <MdVisibility />
                                            View Results
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded bg-secondary-light/10 text-secondary-dark border border-secondary-light/20">
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
            </PageBody>
        </Page>
    );
};

export default Assessments;