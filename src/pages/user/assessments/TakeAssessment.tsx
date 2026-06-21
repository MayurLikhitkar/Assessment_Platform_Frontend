import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ContentBox, Page } from '../../../components/ui/Page';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../services/axios/api';
import toast from 'react-hot-toast';
import { getAssessment, getAssessmentQuestions, startAssessment } from '../../../services/axios/userApi';
import { BsRecordCircle } from 'react-icons/bs';
import { RiAlertLine, RiArrowLeftLine, RiArrowRightLine, RiCheckboxCircleLine, RiFlagLine, RiQuestionLine, RiSendPlaneLine, RiTimeLine } from 'react-icons/ri';
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

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    const styles: Record<Difficulty, string> = {
        easy: 'text-success-dark bg-success-main/20',
        medium: 'text-primary-dark bg-primary-main/20',
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

const QuestionNavItem: React.FC<{
    index: number;
    question: QuestionInterface;
    isActive: boolean;
    isAnswered: boolean;
    isFlagged: boolean;
    onClick: () => void;
}> = ({ index, question, isActive, isAnswered, isFlagged, onClick }) => {
    return (
        <Button variant='custom'
            onClick={onClick}
            className={twMerge(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 cursor-pointer',
                isActive
                    ? 'bg-secondary-light/20 text-secondary-main'
                    : '',
                isAnswered && !isActive && 'text-success-main'
            )}
        >
            <span
                className={twMerge(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    isActive
                        ? 'bg-primary-main text-text-inverse'
                        : isAnswered
                            ? 'bg-success-main text-success-dark'
                            : 'bg-background-main text-text-light'
                )}
            >
                {isAnswered ? (
                    <FaCircleCheck className="w-3.5 h-3.5" />
                ) : (
                    index + 1
                )}
            </span>
            <span className="truncate flex-1">{question.question.slice(0, 40)}...</span>
            {isFlagged && (
                <RiFlagLine className="w-3.5 h-3.5 text-warn-main shrink-0" />
            )}
        </Button>
    );
};

const TakeAssessment: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    const [answers, setAnswers] = useState<Omit<UserAssessmentAnswerInterface, 'timeSpentInSeconds' | 'marksObtained'>[]>([]);
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

    const { data: assessmentQuestions, isLoading: isLoadingAssessmentQuestions } = useQuery({
        queryKey: ['assessment-questions', id],
        queryFn: () => getAssessmentQuestions(id as string | number),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;
    const questions = assessmentQuestions?.data ?? [];

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
            const qId = questions[activeStep]?.id;
            if (qId !== undefined) {
                const elapsed = Math.floor((Date.now() - stepStartRef.current) / 1000);
                answerTimers.current[qId] = (answerTimers.current[qId] ?? 0) + elapsed;
            }
        };
    }, [activeStep, questions]);

    const currentQuestion = questions[activeStep];
    const currentAnswer = answers.find(
        (a) => a.questionId === currentQuestion?._id
    );

    const startMutation = useMutation({
        mutationFn: () => startAssessment(assessment?._id as string),
        onSuccess: (data) => {
            setUserAssessmentId(data.userAssessmentId);
            setSessionId(data.sessionId);
            setQuestions(assessment?.questions || []);
            setStartTime(new Date());
            setTimeLeft((assessment?.durationInMinutes ?? 0) * 60);
            setStarted(true);
            // Initialize answer timers
            (assessment?.questions || []).forEach((q) => {
                answerTimers.current[q] = 0;
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
        (questionId: string, questionType: QuestionType, value: Partial<UserAssessmentAnswerInterface>) => {
            setAnswers((prev) => {
                const index = prev.findIndex((a) => a.questionId === questionId);

                if (index !== -1) {
                    const next = [...prev];
                    next[index] = { ...next[index], ...value };
                    return next;
                }

                return [...prev, { questionId, questionType, ...value }];
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

    if (!assessment) {
        return <PageLoader />
    }

    return (
        <Page>
            <div className="min-h-screen bg-background-main flex flex-col font-semibold text-text-main">
                <ContentBox className="sticky top-0 left-0 right-0 z-40 px-12 py-2 rounded-none">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Title */}
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-bold truncate">
                                {assessment?.title}
                            </h1>
                            <p className="text-xs text-text-light">
                                Question {activeStep + 1} of {questions.length}
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
                                <span className="text-sm font-bold">
                                    {answers.length}/{questions.length}
                                </span>
                                <span className="text-[10px] text-text-light uppercase tracking-wider">
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
                            style={{ width: `${(answers.length / questions.length) * 100}%` }}
                        />
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
                <div className="flex-1 w-full mx-auto px- sm:px-12 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* ── Question Navigator (sidebar) ─────────────────── */}
                        {isLoadingAssessmentQuestions ? <DataLoader /> : (
                            <aside className="lg:col-span-1">
                                <ContentBox className="sticky top-24 space-y-3">
                                    <h3 className="text-xl text-secondary-main">Questions</h3>

                                    <div className="space-y-1">
                                        {questions.map((q, idx) => {
                                            const isAnswered = answers.some(
                                                (a) => a.questionId === q._id
                                            );
                                            return <QuestionNavItem
                                                key={q._id}
                                                index={idx}
                                                question={q}
                                                isActive={idx === activeStep}
                                                isAnswered={isAnswered}
                                                isFlagged={flagged.has(q._id)}
                                                onClick={() => setActiveStep(idx)}
                                            />
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-1 pt-2">
                                        {[
                                            { cls: "bg-primary-main", label: "Current", },
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

                        {/* ── Question Area ────────────────────────────────── */}
                        {isLoadingAssessmentQuestions ? <DataLoader /> : (
                            <main className="lg:col-span-3 space-y-4">
                                <ContentBox className="space-y-4">
                                    {/* Question header */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-primary-main rounded-md text-text-inverse flex items-center justify-center font-bold">
                                            {activeStep + 1}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-text-light">
                                            <DifficultyBadge
                                                difficulty={currentQuestion.difficulty}
                                            />
                                            <span className="">
                                                {currentQuestion.marks} Marks
                                                {currentQuestion.negativeMarks > 0 && (
                                                    <span className="text-error-dark ml-1">
                                                        (-{currentQuestion.negativeMarks} Neg)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question content + answer */}
                                    <div className="space-y-3">
                                        <p className="text-base whitespace-pre-line leading-relaxed">
                                            {currentQuestion?.question}
                                        </p>

                                        {/* ── MCQ ── */}
                                        {currentQuestion.type === QuestionType.MCQ && currentQuestion.options && (
                                            <MultiChoice
                                                id={currentQuestion._id}
                                                options={currentQuestion.options}
                                                isMultiSelect={currentQuestion.isMultiSelect}
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

                                        {currentQuestion.type === QuestionType.CODING && (
                                            <TextArea
                                                id={currentQuestion._id}
                                                name={currentQuestion._id}
                                                rows={12}
                                                placeholder="Write your code here..."
                                            />
                                        )}

                                        {currentQuestion.type === QuestionType.QUERY && (
                                            <TextArea
                                                id={currentQuestion._id}
                                                name={currentQuestion._id}
                                                rows={12}
                                                placeholder="Write your Query here..."
                                            />
                                        )}

                                        {/* ── Coding ── */}
                                        {currentQuestion?.type === "coding" && (
                                            <div className="space-y-3">
                                                {/* <SimpleCodeEditor
                                                language={currentQuestion.language}
                                                starterCode={
                                                    currentQuestion.starterCode?.[
                                                    currentQuestion.language ?? ""
                                                    ]
                                                }
                                                value={
                                                    typeof currentAnswer?.answer === "string"
                                                        ? currentAnswer.answer
                                                        : ""
                                                }
                                                onChange={(code) =>
                                                    handleAnswerChange(currentQuestion.questionId, code)
                                                }
                                            />

                                            {currentQuestion.constraints && (
                                                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-secondary-main/8 border border-secondary-main/20 text-sm text-text-main">
                                                    <RiInformationLine className="w-4 h-4 mt-0.5 shrink-0 text-secondary-main" />
                                                    <div>
                                                        <p className="font-bold text-secondary-main text-xs uppercase tracking-wider mb-1">
                                                            Constraints
                                                        </p>
                                                        <p className="whitespace-pre-line text-text-light">
                                                            {currentQuestion.constraints}
                                                        </p>
                                                    </div>
                                                </div>
                                            )} */}
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation footer */}
                                    <div className="border-border-light flex items-center justify-between gap-3">
                                        <Button
                                            onClick={() => setActiveStep((s) => s - 1)}
                                            disabled={activeStep === 0}
                                            variant='custom'
                                            className="rounded-xl border border-border-main text-text-light hover:bg-muted-light disabled:opacity-40 disabled:cursor-not-allowed">
                                            <RiArrowLeftLine className="w-4 h-4" />
                                            Previous
                                        </Button>

                                        {/* Right group */}
                                        <div className="flex items-center gap-3">
                                            <Button variant='custom'
                                                onClick={() => toggleFlag(currentQuestion._id)}
                                                className={`border rounded-xl text-text-light ${flagged.has(currentQuestion?._id)
                                                    ? "bg-warn-light/30 border-warn-light"
                                                    : "border-border-main hover:bg-muted-light"
                                                    }`}>
                                                <RiFlagLine className="w-4 h-4" />
                                                <span className="hidden sm:inline">
                                                    {flagged.has(currentQuestion?._id)
                                                        ? "Unflag"
                                                        : "Flag"}
                                                </span>
                                            </Button>

                                            {activeStep < questions.length - 1 ? (
                                                <Button className='rounded-xl'
                                                    onClick={() => setActiveStep((s) => s + 1)}>
                                                    Next
                                                    <RiArrowRightLine className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant='success'
                                                    onClick={() => setShowSubmitDialog(true)}
                                                    className="rounded-xl">
                                                    <RiSendPlaneLine className="w-4 h-4" />
                                                    Submit Assessment
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </ContentBox>

                                {/* Skipped questions reminder */}
                                {answers.length < questions.length && (
                                    <div className="flex items-start gap-2.5 p-4 rounded-xl bg-warn-light/15 border border-warn-light/40 text-sm text-warn-dark">
                                        <RiQuestionLine className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>
                                            <strong>{questions.length - answers.length}</strong> question
                                            {questions.length - answers.length > 1 ? "s" : ""} still
                                            unanswered.
                                        </span>
                                    </div>
                                )}
                            </main>
                        )}
                    </div>
                </div>

            </div>
        </Page>
    )
}

export default TakeAssessment;