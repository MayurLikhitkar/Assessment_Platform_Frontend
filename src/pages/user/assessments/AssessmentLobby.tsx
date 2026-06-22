import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { RiTimeLine, RiEyeLine, RiSave2Line, RiPlayCircleLine, RiInformationLine, RiCheckLine, RiAwardLine, RiBrainLine } from 'react-icons/ri';
import moment from 'moment';
import { Page, ContentBox } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import PageLoader from '../../../components/common/PageLoader';
import { getAssessment, startAssessment } from '../../../services/axios/userApi';
import { Difficulty } from '../../../types/questionTypes';
import { MdQuiz } from 'react-icons/md';
import { FaMicrophone } from 'react-icons/fa';
import { TbBrowserX } from 'react-icons/tb';
import { IoVideocam } from 'react-icons/io5';

// ── Types ────────────────────────────────────────────────────────────────────

type ChecklistKey = 'connection' | 'environment' | 'rules';

interface ChecklistItem {
    key: ChecklistKey;
    label: string;
}

// ── Sub-components ───────────────────────────────────────────────────────────

const DifficultyBadge: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
    const styles: Record<Difficulty, string> = {
        easy: 'text-success-dark bg-success-main/20',
        medium: 'text-primary-dark bg-primary-main/20',
        hard: 'text-error-dark bg-error-main/30',
    };
    return (
        <span className={twMerge('px-2.5 py-0.5 rounded uppercase tracking-wide text-xs font-bold', styles[difficulty])}>
            {difficulty}
        </span>
    );
};

interface CheckItemProps {
    item: ChecklistItem;
    checked: boolean;
    onToggle: (key: ChecklistKey) => void;
}

const CheckItem: React.FC<CheckItemProps> = ({ item, checked, onToggle }) => (
    <button
        onClick={() => onToggle(item.key)}
        className="flex items-center gap-3 text-sm text-left text-text-main w-full group"
    >
        <span
            className={twMerge(
                'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-150',
                checked
                    ? 'bg-success-main border-success-main text-text-inverse'
                    : 'border-border-main bg-background-light group-hover:border-border-dark'
            )}
        >
            {checked && <RiCheckLine className="w-3 h-3" />}
        </span>
        <span className={checked ? 'line-through text-text-light' : ''}>{item.label}</span>
    </button>
);

// ── Main Component ───────────────────────────────────────────────────────────

const CHECKLIST_ITEMS: ChecklistItem[] = [
    { key: 'connection', label: 'I have a stable internet connection' },
    { key: 'environment', label: 'I am in a quiet environment without distractions' },
    { key: 'rules', label: 'I have read and understood all the rules above' },
];

const AssessmentLobby: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [checks, setChecks] = useState<Record<ChecklistKey, boolean>>({
        connection: false,
        environment: false,
        rules: false,
    });

    const allChecked = Object.values(checks).every(Boolean);

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string | number),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;

    const startMutation = useMutation({
        mutationFn: () => startAssessment(assessment?._id as string),
        onSuccess: () => {
            navigate(`/assessments/${id}/take`);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to start assessment');
        },
    });

    const toggleCheck = (key: ChecklistKey) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading || !assessment) return <PageLoader />;

    const enableProctoring = assessment.requireWebcam || assessment.requireMicrophone || assessment.allowTabSwitch === false || assessment.allowFullscreenExit === false || assessment.enableRecording;

    const data = [
        { Icon: RiTimeLine, label: 'Duration', value: `${assessment.durationInMinutes} mins` },
        { Icon: RiAwardLine, label: 'Total Marks', value: `${assessment.totalMarks}` },
        { Icon: MdQuiz, label: 'Questions', value: assessment.questions.length },
        { Icon: RiBrainLine, label: 'Difficulty', value: assessment.difficulty },
    ]

    const rules = [
        { icon: RiEyeLine, iconClass: 'bg-warn-main/20 text-warn-dark', active: assessment?.enableRecording, label: 'Switching tabs or leaving the window will be flagged as a violation. Too many violations will terminate your session automatically.' },
        { icon: IoVideocam, active: assessment?.requireWebcam, iconClass: 'bg-error-main/20 text-error-dark', label: 'Your screen or webcam may be recorded throughout the assessment for proctoring purposes.' },
        { icon: RiInformationLine, iconClass: 'bg-muted-main text-text-light', active: !assessment?.allowTabSwitch, label: 'Once the timer runs out, your assessment will be submitted automatically with whatever answers you have provided.' },
        { icon: FaMicrophone, iconClass: 'bg-primary-main/20 text-primary-dark', active: assessment?.requireMicrophone, label: 'Your microphone will be monitored to ensure academic integrity.' },
        { icon: RiSave2Line, iconClass: 'bg-success-main/20 text-success-dark', active: true, label: 'Answers are auto-saved as you progress. You can revisit and change any answer before submitting.' },
        { icon: TbBrowserX, active: !assessment?.allowFullscreenExit, iconClass: 'bg-secondary-main/20 text-secondary-dark', label: 'Do not refresh or close the browser during the assessment. Your progress may not be recoverable.' },
    ];

    return (
        <Page>
            <div className="min-h-screen bg-background-main flex flex-col font-semibold text-text-main py-10 px-4">
                <div className="max-w-4xl mx-auto space-y-5">
                    {/* Header card */}
                    <ContentBox className="space-y-4">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                            {assessment.type.map((t) => (
                                <span key={t} className="px-3 py-1 rounded-md bg-muted-light text-text-light uppercase border border-border-light">
                                    {t}
                                </span>
                            ))}
                            {enableProctoring && (
                                <span className="px-3 py-1 rounded-md bg-error-main/10 text-error-dark border border-error-light">
                                    Proctored
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl font-bold">
                            {assessment.title}
                        </h1>

                        <p className="text-sm text-text-light">
                            {assessment.description}
                        </p>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {data.map((stat) => (
                                <div key={stat.label} className="bg-muted-light rounded-xl py-4 px-6 flex flex-col gap-1 border border-border-light/70">
                                    <span className="flex items-center gap-1.5 text-xs text-text-light">
                                        <stat.Icon className="w-4 h-4" />
                                        {stat.label}
                                    </span>
                                    <span className="text-xl font-semibold text-text-main capitalize">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </ContentBox>

                    {/* Rules card */}
                    <ContentBox className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-text-light">
                            Rules &amp; guidelines
                        </h2>
                        <div className="space-y-3">
                            {rules.map((rule) => (
                                <div key={rule.label} className="flex items-center gap-3 text-sm">
                                    <span className={twMerge('p-2 rounded-full flex items-center justify-center', rule.iconClass)}>
                                        <rule.icon className='w-4 h-4 shrink-0' />
                                    </span>
                                    <span className="leading-relaxed">{rule.label}</span>
                                </div>
                            ))}
                        </div>
                    </ContentBox>

                    {/* Checklist + CTA */}
                    <ContentBox className="space-y-5">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-text-light mb-3">
                                Before you begin
                            </h2>
                            <div className="space-y-3">
                                {CHECKLIST_ITEMS.map((item) => (
                                    <CheckItem
                                        key={item.key}
                                        item={item}
                                        checked={checks[item.key]}
                                        onToggle={toggleCheck}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Warning when not all checked */}
                        {!allChecked && (
                            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-warn-light/10 border border-warn-light text-sm text-warn-dark">
                                <RiInformationLine className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>Please confirm all three items above before starting.</span>
                            </div>
                        )}

                        {/* CTA */}
                        <Button
                            variant={allChecked ? 'primary' : 'custom'}
                            disabled={!allChecked || startMutation.isPending}
                            loading={startMutation.isPending}
                            onClick={() => startMutation.mutate()}
                            className={twMerge(
                                'w-full rounded-xl justify-center text-base py-3 gap-2',
                                !allChecked && 'opacity-50 cursor-not-allowed'
                            )}>
                            <RiPlayCircleLine className="w-5 h-5" />
                            {startMutation.isPending ? 'Starting…' : 'Begin assessment'}
                        </Button>

                        <p className="text-center text-xs text-error-dark">
                            Timer starts immediately when you click Begin
                        </p>
                    </ContentBox>
                </div>
            </div>
        </Page>
    );
};

export default AssessmentLobby;