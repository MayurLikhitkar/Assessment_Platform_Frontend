import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ContentBox } from '../../../components/ui/Page';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAssessment, getAssessmentQuestions, syncAssessmentAnswers } from '../../../services/axios/userApi';
import { BsRecordCircle } from 'react-icons/bs';
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiCodeSSlashLine, RiDatabase2Line, RiFileTextLine, RiFlagFill, RiFlagLine, RiInformationLine, RiListCheck3, RiRefreshLine, RiSendPlaneLine, RiTimeLine } from 'react-icons/ri';
import type { UserAssessmentAnswerInterface } from '../../../types/userAssessmentTypes';
import moment from 'moment';
import DataLoader from '../../../components/common/DataLoader';
import { Difficulty, QuestionType, type QuestionInterface } from '../../../types/questionTypes';
import MultiChoice from '../../../components/ui/MultiChoice';
import TextArea from '../../../components/ui/TextArea';
import Button from '../../../components/ui/Button';
import { twMerge } from 'tailwind-merge';
import PageLoader from '../../../components/common/PageLoader';
import { FaCircleCheck } from 'react-icons/fa6';
import TerminateModal from '../../../components/assessment/TerminateModal';
import WarningModal from '../../../components/assessment/WarningModal';
import SubmitModal from '../../../components/assessment/SubmitModal';
import SuccessModal from '../../../components/assessment/SuccessScreen';
import { LuClipboard } from 'react-icons/lu';
import { TbArrowsMaximize } from 'react-icons/tb';
import { useAuth } from '../../../hooks/useAuth';
import CodeEditor from '../../../components/common/CodeEditor';

type NavButtonProps = {
    index: number;
    question: QuestionInterface;
    isActive: boolean;
    isAnswered: boolean;
    isFlagged: boolean;
    onClick: () => void;
};

const TYPE_ICON: Record<QuestionType, React.ElementType> = {
    mcq: RiListCheck3,
    coding: RiCodeSSlashLine,
    query: RiDatabase2Line,
    subjective: RiFileTextLine,
};

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    const styles: Record<Difficulty, string> = {
        easy: 'text-success-dark bg-success-main/20',
        medium: 'text-accent-dark bg-accent-main/20',
        hard: 'text-error-dark bg-error-main/30',
    };
    return (
        <span
            className={twMerge(
                'px-2.5 py-0.5 rounded uppercase tracking-wide',
                styles[difficulty]
            )}>
            {difficulty}
        </span>
    );
};

const QuestionNavItem: React.FC<NavButtonProps> = ({ index, question, isActive, isAnswered, isFlagged, onClick }) => {
    return (
        <Button variant='custom'
            onClick={onClick}
            className={twMerge(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-all duration-200 cursor-pointer border',
                isActive
                    ? 'bg-accent-light/10 text-accent-main border-accent-light/50'
                    : 'border-border-light hover:bg-muted-light/70',
                isAnswered && !isActive && 'text-success-main border-success-light/50'
            )}
        >
            {isFlagged && (
                <RiFlagFill className="w-4 h-4 text-warn-main shrink-0" />
            )}
            <span
                className={twMerge(
                    'w-6 h-6 rounded flex items-center justify-center font-bold shrink-0',
                    isActive
                        ? 'bg-accent-main text-text-inverse'
                        : isAnswered
                            ? 'bg-success-main text-text-inverse'
                            : 'bg-muted-main/60 text-text-light'
                )}
            >
                {isAnswered ? (
                    <FaCircleCheck className="w-4 h-4 shrink-0" />
                ) : (
                    index + 1
                )}
            </span>
            <span className="truncate flex-1">{question.question.slice(0, 45)}…</span>
            <span className="uppercase text-text-light/80 text-xs shrink-0 hidden sm:block">
                {question.type}
            </span>
        </Button>
    );
};

const TakeAssessment: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();


    const [terminated, setTerminated] = useState(false);
    const [terminateReason, setTerminateReason] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isAutoSubmit, setIsAutoSubmit] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    const hasStartedFullscreen = useRef(!!document.fullscreenElement);

    // ── answer / navigation ───────────────────────────────────────────────────
    const [activeStep, setActiveStep] = useState(0);
    const [answers, setAnswers] = useState<Omit<UserAssessmentAnswerInterface, 'marksObtained'>[]>([]);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
    const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string),
        enabled: !!id,
    });

    const { data: assessmentQuestions, isLoading: isLoadingAssessmentQuestions } = useQuery({
        queryKey: ['assessment-questions', id],
        queryFn: () => getAssessmentQuestions(id as string),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;
    const questions = assessmentQuestions?.data ?? [];

    // ── proctoring state ──────────────────────────────────────────────────────
    const [tabViolations, setTabViolations] = useState(0);
    const [fsViolations, setFsViolations] = useState(0);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    // ── timer state ───────────────────────────────────────────────────────────
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // ── refs ──────────────────────────────────────────────────────────────────
    const totalSeconds = React.useMemo(
        () => (assessment?.durationInMinutes ?? 0) * 60,
        [assessment?.durationInMinutes]
    );
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerInitialized = useRef(false);

    const stepStartRef = useRef<number>(0);
    const answerTimers = useRef<Record<string, number>>({});
    const startTimestamp = useRef<number>(0);

    const currentQuestion = questions[activeStep];
    const currentAnswer = answers.find((a) => a.questionId === currentQuestion?._id);
    const timerCritical = timeLeft !== null && timeLeft <= 300;

    const flushTime = useCallback(() => {
        const qId = questions[activeStep]?._id;
        if (!qId) return;
        const elapsed = Math.floor((Date.now() - stepStartRef.current) / 1000);
        if (elapsed > 0) {
            answerTimers.current[qId] = (answerTimers.current[qId] ?? 0) + elapsed;
        }
        stepStartRef.current = Date.now();
    }, [questions, activeStep]);

    const goToStep = useCallback((next: number) => {
        flushTime();
        setActiveStep(next);
    }, [flushTime]);

    useEffect(() => {
        return () => {
            flushTime();
        };
    }, []);

    function addTabViolation(detail: string) {
        setTabViolations((prev) => {
            const next = prev + 1;
            const max = 2;

            if (next >= max) {
                terminate(`Assessment terminated: You switched tab and exited assessment more than ${max - 1} time(s) allowed. ${detail}`);
                return next;
            }

            const remaining = max - next;
            if (remaining == 0) {
                setWarningMessage(
                    `Final warning: You have switched tab and exited assessment ${next} allowed times. One more violation will immediately terminate your assessment.`
                );
            } else {
                setWarningMessage(
                    `Tab switch detected. You have ${remaining} chances remaining.`
                );
            }

            return next;
        });
    }

    function addFsViolation() {
        setFsViolations((prev) => {
            const next = prev + 1;
            const max = 2;

            if (next >= max) {
                terminate(`Assessment terminated: You exited fullscreen more than ${max - 1} time(s) allowed.`);
                return next;
            }

            const remaining = max - next;
            if (remaining === 1) {
                setWarningMessage(
                    `Final warning: You have exited fullscreen ${next} allowed times. One more exit will immediately terminate your assessment.`
                );
            } else {
                setWarningMessage(
                    `Fullscreen exit detected. You have ${remaining} chances remaining.`
                );
            }

            return next;
        });
    }

    function terminate(reason: string) {
        setTerminateReason(reason);
        setTerminated(true);
        // Stop the timer
        if (timerRef.current) clearInterval(timerRef.current);
        // Exit fullscreen on termination
        if (document.fullscreenElement) document.exitFullscreen?.();
    }

    // timer effect:
    useEffect(() => {
        if (!assessment?.durationInMinutes || timerInitialized.current) return;
        timerInitialized.current = true;
        startTimestamp.current = Date.now();
        stepStartRef.current = Date.now();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const current = prev ?? totalSeconds;
                if (current <= 1) {
                    clearInterval(timerRef.current!);
                    // Auto-submit
                    setIsAutoSubmit(true);
                    setShowSubmitModal(true);
                    return 0;
                }
                return current - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [assessment?.durationInMinutes]);

    const buildAnswersPayload = useCallback((): Omit<UserAssessmentAnswerInterface, 'marksObtained'>[] => {
        flushTime();
        return answers.map((a) => ({
            ...a,
            timeSpentInSeconds: answerTimers.current[a.questionId] ?? 0,
        }));
    }, [answers, flushTime]);

    const syncAnswersMutation = useMutation({
        mutationFn: (payload: Omit<UserAssessmentAnswerInterface, 'marksObtained'>[]) =>
            syncAssessmentAnswers(user?._id as string, assessment?._id as string, payload),
        onSuccess: (_data, payload) => {
            setDirtyIds((prev) => {
                const next = new Set(prev);
                payload.forEach((a) => next.delete(a.questionId));
                return next;
            });
            setLastSyncedAt(Date.now());
        },
        onError: () => {
            toast.error('Failed to sync answers. Will retry automatically.');
            // Leave dirtyIds untouched so the next auto-sync / manual sync retries.
        },
    });

    const handleSync = useCallback(() => {
        if (dirtyIds.size === 0 || syncAnswersMutation.isPending) return;
        const payload = buildAnswersPayload().filter((a) => dirtyIds.has(a.questionId));
        if (payload.length === 0) return;
        console.log('Syncing answers...', payload);
        // syncAnswersMutation.mutate(payload);
    }, [dirtyIds, buildAnswersPayload, syncAnswersMutation]);

    const hasActualContent = (answer: Omit<UserAssessmentAnswerInterface, 'marksObtained'> | undefined) => {
        if (!answer) return false;
        if (answer.answerCoding) {
            return Object.values(answer.answerCoding).some((code: string) =>
                code && code.trim().length > 10 && !code.includes('// TODO')
            );
        }
        if (answer.answerQuery) {
            return answer.answerQuery.trim().length > 5;
        }
        return true; // MCQ / subjective already handled by handleAnswerChange
    };

    const handleAnswerChange = useCallback(
        (questionId: string, questionType: QuestionType, value: Partial<UserAssessmentAnswerInterface>) => {
            setAnswers((prev) => {
                const index = prev.findIndex((a) => a.questionId === questionId);

                if (index !== -1) {
                    const next = [...prev];
                    next[index] = { ...next[index], ...value };
                    return next;
                }

                return [...prev, { questionId, questionType, answerMCQ: [], timeSpentInSeconds: answerTimers.current[questionId] ?? 0, ...value }];
            });
            setDirtyIds((prev) => new Set(prev).add(questionId));
        },
        []
    );

    const handleSubmitAssessment = async () => {
        setIsSubmitting(true);
        try {
            // Make sure everything outstanding — including time on the
            // question the user was on when they hit submit — goes up first.
            const finalPayload = buildAnswersPayload();
            // await api.post(`/assessments/${id}/submit`, { answers: finalPayload });
            setIsSubmitting(false);
            setShowSubmitModal(false);

            if (timerRef.current) clearInterval(timerRef.current);
            setSubmitted(true);

            if (document.fullscreenElement) document.exitFullscreen?.();
        } catch {
            setIsSubmitting(false);
            toast.error('Failed to submit assessment. Please try again.');
        }
    };

    const toggleFlag = (questionId: string) => {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    // Tab monitoring
    useEffect(() => {
        if (!assessment || terminated || submitted || assessment.tabSwitch.allowed) return;

        let hidden = false;

        const onVisibilityChange = () => {
            if (document.hidden && !hidden) {
                hidden = true;
                // addTabViolation('Tab switch / window minimised detected.');
            } else if (!document.hidden) {
                hidden = false;
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [terminated, submitted, assessment]);

    // Fullscreen monitoring
    useEffect(() => {
        if (!assessment || terminated || submitted || assessment.fullscreenExit.allowed) return;

        const onFullscreenChange = () => {
            const active = !!document.fullscreenElement;
            setIsFullscreen(active);

            if (active) {
                hasStartedFullscreen.current = true;
                return;
            }

            // Only count as a violation if they were already in fullscreen and left it.
            // If they simply haven't entered fullscreen yet (fresh load / refresh),
            // the gate screen below handles it — no violation yet.
            if (hasStartedFullscreen.current) {
                // addFsViolation();
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, [terminated, submitted, assessment]);

    const enterFullscreen = useCallback(() => {
        document.documentElement.requestFullscreen?.().catch(() => {
            toast.error('Please allow fullscreen to continue the assessment.');
        });
    }, []);

    if (!assessment) {
        return <PageLoader />
    }

    if (terminated) {
        return <TerminateModal
            isOpen={terminated}
            reason={terminateReason}
            onExit={() => globalThis.location.reload()} />
    }

    if (submitted) {
        const finalTimeSpent = Object.values(answerTimers.current).reduce((sum, s) => sum + s, 0);
        return (
            <SuccessModal
                isOpen={submitted}
                title={assessment.title}
                answeredCount={answers.length}
                totalQuestions={questions.length}
                timeSpentSeconds={finalTimeSpent}
                onExit={() => globalThis.location.reload()}
            />
        );
    }

    const totalViolations = tabViolations + fsViolations;

    // if (!assessment.fullscreenExit.allowed && !isFullscreen) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center p-4">
    //             <ContentBox className="max-w-md w-full text-center space-y-4 py-8">
    //                 <TbArrowsMaximize className="w-10 h-10 mx-auto text-accent-main" />
    //                 <h2 className="font-bold text-lg">Fullscreen Required</h2>
    //                 <p className="text-sm text-text-light">
    //                     This assessment must be taken in fullscreen mode. Click below to continue.
    //                 </p>
    //                 <Button
    //                     variant="accent"
    //                     className="rounded-md mx-auto"
    //                     onClick={enterFullscreen}
    //                 >
    //                     Enter Fullscreen &amp; Continue
    //                 </Button>
    //             </ContentBox>
    //         </div>
    //     );
    // }

    if (isLoading) {
        return <PageLoader />
    }

    const Icon = currentQuestion ? TYPE_ICON[currentQuestion.type] : RiFileTextLine;

    return (
        <div className="p-3">
            <div className="max-w-7xl mx-auto space-y-6 bg-background-main flex flex-col font-semibold text-text-main">
                {warningMessage && (
                    <WarningModal
                        isOpen={!!warningMessage}
                        message={warningMessage || ''}
                        violationCount={totalViolations}
                        maxViolations={(assessment.tabSwitch.max ?? 2) + (assessment.fullscreenExit.max ?? 1)}
                        onDismiss={() => setWarningMessage(null)}
                    />
                )}

                {showSubmitModal && (
                    <SubmitModal
                        isOpen={showSubmitModal}
                        totalQuestions={questions.length}
                        answeredCount={answers.length}
                        flaggedCount={flagged.size}
                        isAutoSubmit={isAutoSubmit}
                        isSubmitting={isSubmitting}
                        onConfirm={handleSubmitAssessment}
                        onCancel={() => {
                            setShowSubmitModal(false);
                            setIsAutoSubmit(false);
                        }}
                    />
                )}

                <div className='space-y-4'>
                    <ContentBox className="flex items-center justify-between h-16 gap-4">
                        {/* Title */}
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base truncate tracking-wide">
                                {assessment?.title}
                            </h1>
                            <p className="text-xs text-text-light">
                                Question {activeStep + 1} of {questions.length}
                            </p>
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-xs text-error-main font-bold">
                                Violations: {totalViolations}
                            </div>

                            {/* Recording badge */}
                            {assessment?.enableRecording && (
                                <div className="hidden sm:flex items-center text-xs gap-2 px-2 py-1 rounded-md text-error-main bg-error-light/10 border border-error-light/20">
                                    <BsRecordCircle className="w-4 h-4 animate-pulse" />
                                    <span className="font-bold">REC</span>
                                </div>
                            )}

                            <Button
                                variant="custom"
                                onClick={handleSync}
                                disabled={syncAnswersMutation.isPending || dirtyIds.size === 0}
                                className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg border border-border-light text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                                title={
                                    lastSyncedAt
                                        ? `Last synced ${moment(lastSyncedAt).format('HH:mm:ss')}`
                                        : 'Not synced yet'
                                }
                            >
                                {syncAnswersMutation.isPending ? (
                                    <RiRefreshLine className="w-4 h-4 animate-spin" />
                                ) : dirtyIds.size === 0 ? (
                                    <RiCheckLine className="w-4 h-4 text-success-main" />
                                ) : (
                                    <RiRefreshLine className="w-4 h-4" />
                                )}
                                {syncAnswersMutation.isPending
                                    ? 'Syncing…'
                                    : dirtyIds.size === 0
                                        ? 'Synced'
                                        : `Sync (${dirtyIds.size})`}
                            </Button>

                            {/* Answered count */}
                            <div className="hidden sm:flex flex-col items-center leading-none">
                                <span className="text-sm font-bold">
                                    {answers.length}/{questions.length}
                                </span>
                                <span className="text-xs text-text-light">
                                    Answered
                                </span>
                            </div>

                            {/* Timer */}
                            <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-mono font-bold text-sm transition-colors ${timerCritical
                                    ? "bg-error-light/20 border-error-light text-error-main"
                                    : "bg-background-main border-border-light"
                                    }`}
                            >
                                <RiTimeLine
                                    className={`w-4 h-4 ${timerCritical ? "animate-pulse" : ""}`}
                                />
                                {moment.utc((timeLeft ?? totalSeconds) * 1000).format('HH:mm:ss')}
                            </div>
                        </div>
                    </ContentBox>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        <Button
                            onClick={() => goToStep(activeStep - 1)}
                            disabled={activeStep === 0}
                            variant='custom'
                            className="rounded-md border border-border-light text-text-light bg-background-light shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                            <RiArrowLeftLine className="w-4 h-4" />
                            Previous
                        </Button>

                        {/* Right group */}
                        <div className="flex items-center gap-3">
                            {!isLoadingAssessmentQuestions && <Button variant='custom'
                                onClick={() => toggleFlag(currentQuestion._id)}
                                className={`border rounded-md text-text-light bg-background-light ${flagged.has(currentQuestion?._id)
                                    ? "bg-warn-light/30 border-warn-light"
                                    : "border-border-light shadow-sm"
                                    }`}>
                                <RiFlagLine className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {flagged.has(currentQuestion?._id)
                                        ? "Unflag"
                                        : "Flag for review"}
                                </span>
                            </Button>}

                            {activeStep < questions.length - 1 ? (
                                <Button className='rounded-md' variant='accent'
                                    onClick={() => goToStep(activeStep + 1)}>
                                    Next
                                    <RiArrowRightLine className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant='success'
                                    onClick={() => { flushTime(); setShowSubmitModal(true); }}
                                    className="rounded-md">
                                    <RiSendPlaneLine className="w-4 h-4" />
                                    Submit Assessment
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Main Layout ─────────────────────────────────────── */}
                {/* {Paste here} */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* ── Question Area ────────────────────────────────── */}
                    {currentQuestion ? (
                        <main className="lg:col-span-3 space-y-4">
                            <ContentBox className="space-y-5 overflow-y-auto scroll-smooth" style={{ height: 'calc(100vh - 25vh)' }}>
                                {/* Question header */}
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-accent-main rounded-md text-text-inverse flex items-center justify-center">
                                        <Icon className="text-lg shrink-0" />
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-text-light">
                                        <DifficultyBadge
                                            difficulty={currentQuestion.difficulty}
                                        />
                                        <span className="">
                                            {currentQuestion.marks} Marks
                                            {assessment.negativeMarking && currentQuestion.negativeMarks > 0 && (
                                                <span className="text-error-dark ml-1">
                                                    (-{currentQuestion.negativeMarks} Neg)
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="ml-auto flex flex-wrap gap-1 text-text-light/70">
                                        {currentQuestion?.tags?.length > 0 && currentQuestion.tags.map((t) => (
                                            <span key={t} className="rounded bg-muted-main border border-border-light px-2 py-1 text-xs capitalize">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Question content + answer */}
                                <div className="space-y-3">
                                    <p className="text-base whitespace-pre-line leading-relaxed">
                                        {currentQuestion?.question}
                                    </p>

                                    {/* ── MCQ ── */}
                                    {currentQuestion.type === QuestionType.MCQ && currentQuestion?.mcqFields?.options && (
                                        <MultiChoice
                                            id={currentQuestion._id}
                                            options={currentQuestion.mcqFields.options}
                                            isMultiSelect={currentQuestion.mcqFields.isMultiSelect}
                                            value={currentAnswer?.answerMCQ || []}
                                            onChange={(selected: string[]) =>
                                                handleAnswerChange(
                                                    currentQuestion._id,
                                                    currentQuestion.type,
                                                    { answerMCQ: selected }
                                                )
                                            }
                                        />
                                    )}

                                    {currentQuestion.type === QuestionType.SUBJECTIVE && (
                                        <TextArea
                                            id={currentQuestion._id}
                                            name={currentQuestion._id}
                                            rows={8}
                                            className='border border-border-light'
                                            placeholder="Type your answer here..."
                                            value={currentAnswer?.answerSubjective || ""}
                                            onChange={(e) =>
                                                handleAnswerChange(
                                                    currentQuestion._id,
                                                    currentQuestion.type,
                                                    { answerSubjective: e.target.value }
                                                )
                                            }
                                        />
                                    )}

                                    {currentQuestion.type === QuestionType.CODING && currentQuestion.codingFields?.constraints && (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-light/10 border border-accent-light/10 text-xs text-accent-light">
                                            <RiInformationLine className="text-lg text-accent-main shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-bold uppercase tracking-wide">
                                                    Constraints
                                                </p>
                                                <ul className="list-disc list-inside">
                                                    {currentQuestion.codingFields.constraints.map((c, i) => (
                                                        <li key={i}>{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {currentQuestion.type === QuestionType.CODING && (
                                        <CodeEditor
                                            key={currentQuestion._id}
                                            type={QuestionType.CODING}
                                            question={currentQuestion}
                                            value={currentAnswer?.answerCoding}
                                            onChange={(value) =>
                                                handleAnswerChange(
                                                    currentQuestion._id,
                                                    QuestionType.CODING,
                                                    { answerCoding: value }
                                                )
                                            }
                                        />
                                    )}

                                    {currentQuestion.type === QuestionType.QUERY && (
                                        <CodeEditor
                                            key={currentQuestion._id}
                                            type={QuestionType.QUERY}
                                            question={currentQuestion}
                                            value={currentAnswer?.answerQuery}
                                            onChange={(value) =>
                                                handleAnswerChange(
                                                    currentQuestion._id,
                                                    QuestionType.QUERY,
                                                    { answerQuery: value }
                                                )
                                            }
                                        />
                                    )}
                                </div>
                            </ContentBox>
                        </main>
                    ) : <div className="lg:col-span-3" ><DataLoader /></div>}

                    {/* ── Question Navigator (sidebar) ─────────────────── */}
                    {isLoadingAssessmentQuestions ? <DataLoader /> : (
                        <aside className="">
                            <ContentBox className="space-y-3 overflow-y-auto scroll-smooth" style={{ height: 'calc(100vh - 25vh)' }}>
                                <h3 className="text-text-light"><LuClipboard className="inline-block mr-2 text-lg shrink-0 text-accent-main" />Questions</h3>

                                <div className="space-y-2">
                                    {questions.map((q, idx) => {
                                        const isAnswered = answers.some((a) => a.questionId === q._id) &&
                                            (q.type !== QuestionType.CODING && q.type !== QuestionType.QUERY ||
                                                hasActualContent(answers.find(a => a.questionId === q._id)));
                                        return <QuestionNavItem
                                            key={q._id}
                                            index={idx}
                                            question={q}
                                            isActive={idx === activeStep}
                                            isAnswered={isAnswered}
                                            isFlagged={flagged.has(q._id)}
                                            onClick={() => goToStep(idx)}
                                        />
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="space-y-1 pt-2">
                                    {[
                                        { cls: "bg-accent-main", label: "Current", },
                                        { cls: "bg-success-main/40 border border-success-light", label: "Answered", },
                                        { cls: "bg-muted-main border border-border-light", label: "Unanswered", },
                                        { cls: "bg-warn-main/80", label: "Flagged", },
                                    ].map((l) => (
                                        <div key={l.label} className="flex items-center gap-2">
                                            <span
                                                className={`w-3 h-3 rounded-sm shrink-0 ${l.cls}`}
                                            />
                                            <span className="text-xs text-text-light">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </ContentBox>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TakeAssessment;