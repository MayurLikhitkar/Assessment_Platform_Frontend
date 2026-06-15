import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ContentBox, Page } from '../../../components/ui/Page';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../services/axios/api';
import toast from 'react-hot-toast';
import { getAssessment } from '../../../services/axios/userApi';
import { BsRecordCircle } from 'react-icons/bs';
import { RiAlertLine, RiArrowLeftLine, RiArrowRightLine, RiCheckboxCircleLine, RiFlagLine, RiQuestionLine, RiSendPlaneLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri';
import type { UserAssessmentAnswerInterface } from '../../../types/userAssessmentTypes';
import moment from 'moment';

const TakeAssessment: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState<UserAssessmentAnswerInterface[]>([]);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [userAssessmentId, setUserAssessmentId] = useState<number | null>(null);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [violations, setViolations] = useState([]);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [started, setStarted] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const answerTimers = useRef<Record<number, number>>({});
    const stepStartRef = useRef<number>(0);

    const timerCritical = timeLeft <= 300;

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string | number),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;

    useEffect(() => {
        stepStartRef.current = Date.now();
    }, [activeStep]);

    // timer effect:
    useEffect(() => {
        if (!started) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    setShowSubmitDialog(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [started])

    useEffect(() => {
        stepStartRef.current = Date.now();
        return () => {
            const qId = assessment?.questions[activeStep]?.id;
            if (qId !== undefined) {
                const elapsed = Math.floor((Date.now() - stepStartRef.current) / 1000);
                answerTimers.current[qId] = (answerTimers.current[qId] ?? 0) + elapsed;
            }
        };
    }, [activeStep, assessment?.questions]);

    const currentQuestion = assessment?.questions[activeStep];
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion);

    const startMutation = useMutation({
        mutationFn: () => api.post(`/assessments/${id}/start`),
        onSuccess: (data) => {
            setUserAssessmentId(data.userAssessmentId);
            setSessionId(data.sessionId);
            setStartTime(new Date());
            setTimeLeft(data.assessment.duration * 60); // Convert to seconds
            setTimeLeft(data.assessment.duration * 60);
            setStarted(true);
            // Initialize answer timers
            data.assessment.questions.forEach((q) => {
                answerTimers.current[q.questionId] = 0;
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to start assessment');
            navigate('/assessments');
        },
    });

    // Submit answer mutation
    const submitAnswerMutation = useMutation({
        mutationFn: (data) => api.post(`/assessments/${id}/answer`, data),
        onError: (error) => {
            toast.error('Failed to save answer');
        },
    });

    const handleAnswerChange = useCallback(
        (questionId: number, value: Answer["answer"]) => {
            setAnswers((prev) => {
                const existing = prev.findIndex((a) => a.questionId === questionId);
                if (existing >= 0) {
                    const next = [...prev];
                    next[existing] = { questionId, answer: value };
                    return next;
                }
                return [...prev, { questionId, answer: value }];
            });
        },
        []
    );

    const handleSubmitAssessment = async () => {
        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 1500)); // simulate API call
        setIsSubmitting(false);
        setShowSubmitDialog(false);
        setSubmitted(true);
    };

    if (!assessment) {
        return <>Something went wrong</>
    }

    const totalQuestions = assessment.questions.length;

    return (
        <Page>
            <div className="min-h-screen bg-background-main flex flex-col">
                <ContentBox className="sticky top-0 z-40 p-1">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between h-16 gap-4">
                            {/* Title */}
                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-base font-bold text-text-main truncate">
                                    {assessment?.title}
                                </h1>
                                <p className="text-xs text-text-light">
                                    Question {activeStep + 1} of {assessment?.questions?.length}
                                </p>
                            </div>

                            {/* Right controls */}
                            <div className="flex items-center gap-3 shrink-0">
                                {/* Recording badge */}
                                {assessment?.enableRecording && (
                                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error-light/20 border border-error-light/40">
                                        <BsRecordCircle className="w-3.5 h-3.5 text-error-main animate-pulse" />
                                        <span className="text-xs font-bold text-error-main">REC</span>
                                    </div>
                                )}

                                {/* Answered count */}
                                <div className="hidden sm:flex flex-col items-center leading-none">
                                    <span className="text-sm font-bold text-text-main">
                                        {/* {answers.length}/{totalQuestions} */}
                                        {answers.length}/{totalQuestions}
                                    </span>
                                    <span className="text-[10px] text-text-light uppercase tracking-wider">
                                        Answered
                                    </span>
                                </div>

                                {/* Timer */}
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-mono font-bold text-sm transition-colors ${timerCritical
                                        ? "bg-error-light/20 border-error-light text-error-main"
                                        : "bg-background-main border-border-light text-text-main"
                                        }`}
                                >
                                    <RiTimeLine
                                        className={`w-4 h-4 ${timerCritical ? "animate-pulse" : ""}`}
                                    />
                                    {moment.utc(timeLeft * 1000).format('HH:mm:ss')}
                                </div>

                                {/* Submit button */}
                                <button
                                    onClick={() => setShowSubmitDialog(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-main text-text-inverse text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all"
                                >
                                    <RiSendPlaneLine className="w-4 h-4" />
                                    <span className="hidden sm:inline">Submit</span>
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1 bg-muted-main rounded-full mb-0.5 overflow-hidden">
                            <div
                                className="h-full bg-primary-main rounded-full transition-all duration-500"
                                style={{ width: `${(answers.length / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>
                </ContentBox>

                {/* ── Violation Alert ─────────────────────────────────── */}
                {violations.length > 0 && (
                    <div className="bg-warn-light/20 border-b border-warn-light/40 px-4 py-2.5 flex items-center gap-2 text-warn-dark text-sm">
                        <RiAlertLine className="w-4 h-4 shrink-0" />
                        <span>
                            <strong>{violations.length}</strong> proctoring violation
                            {violations.length > 1 ? "s" : ""} detected. Excessive violations
                            may terminate your session.
                        </span>
                    </div>
                )}

                {/* ── Main Layout ─────────────────────────────────────── */}
                {/* {Paste here} */}
            </div>
        </Page>
    )
}

export default TakeAssessment;