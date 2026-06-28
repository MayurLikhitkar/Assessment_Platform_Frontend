import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { RiTimeLine, RiEyeLine, RiPlayCircleLine, RiInformationLine, RiCheckLine, RiAwardLine, RiBrainLine, RiLoader4Line, RiShieldCheckLine, } from 'react-icons/ri';
import { Page, ContentBox } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import PageLoader from '../../../components/common/PageLoader';
import { getAssessment, startAssessment } from '../../../services/axios/userApi';
import { MdQuiz } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { TbArrowsMaximize, TbBrowserX } from 'react-icons/tb';
import { IoVideocam, IoVideocamOff } from 'react-icons/io5';
import { BsDisplay } from 'react-icons/bs';
import Input from '../../../components/ui/Input';
import type { ApiResponse } from '../../../types/types';
import PermissionCard, { type PermStatus } from '../../../components/assessment/PermissionCard';

type ChecklistKey = 'connection' | 'environment' | 'rules';

interface ChecklistItem {
    key: ChecklistKey;
    label: string;
}

interface PermissionState {
    webcam: PermStatus;
    microphone: PermStatus;
    fullscreen: PermStatus;
}

interface PermCardProps {
    key: keyof PermissionState;
    title: string;
    description: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    preview?: React.ReactNode;
}

const ReadinessRow: React.FC<{ label: string; done: boolean; detail: string }> = ({ label, done, detail }) => (
    <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
            <span
                className={twMerge(
                    'w-4 h-4 rounded-full flex items-center justify-center',
                    done ? 'bg-background-main text-success-main' : 'bg-background-main text-text-light'
                )}
            >
                {done ? <RiCheckLine className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-background-main block" />}
            </span>
            <span className="text-text-main">{label}</span>
        </div>
        <span className={twMerge('font-semibold', done ? 'text-success-main' : 'text-text-light')}>{detail}</span>
    </div>
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

    const { data: assessmentData, isLoading } = useQuery({
        queryKey: ['assessment', id],
        queryFn: () => getAssessment(id as string | number),
        enabled: !!id,
    });

    const assessment = assessmentData?.data;

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [perms, setPerms] = useState<PermissionState>({
        webcam: 'idle',
        microphone: 'idle',
        fullscreen: document.fullscreenElement ? 'granted' : 'idle',
    });

    const [micLevel, setMicLevel] = useState(0);
    const micAnimRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const [checks, setChecks] = useState<Record<ChecklistKey, boolean>>({
        connection: false,
        environment: false,
        rules: false,
    });

    const startMicVisualizer = useCallback((stream: MediaStream) => {
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
            analyser.getByteFrequencyData(data);
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            setMicLevel(Math.min(100, (avg / 128) * 100));
            micAnimRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    const requestWebcam = useCallback(async () => {
        setPerms((p) => ({ ...p, webcam: 'checking' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setPerms((p) => ({ ...p, webcam: 'granted' }));
        } catch {
            setPerms((p) => ({ ...p, webcam: 'denied' }));
        }
    }, []);

    const requestMicrophone = useCallback(async () => {
        setPerms((p) => ({ ...p, microphone: 'checking' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startMicVisualizer(stream);
            setPerms((p) => ({ ...p, microphone: 'granted' }));
        } catch {
            setPerms((p) => ({ ...p, microphone: 'denied' }));
        }
    }, [startMicVisualizer]);

    const requestFullscreen = useCallback(async () => {
        setPerms((p) => ({ ...p, fullscreen: 'checking' }));
        try {
            await document.documentElement.requestFullscreen();
            setPerms((p) => ({ ...p, fullscreen: 'granted' }));
        } catch {
            setPerms((p) => ({ ...p, fullscreen: 'denied' }));
        }
    }, []);

    const permissionConfig = useMemo(() => {
        if (!assessment) return null;

        return {
            webcamRequired: assessment.requireWebcam,
            microphoneRequired: assessment.requireMicrophone,
            fullscreenRequired: !assessment.allowFullscreenExit,
        };
    }, [assessment]);

    useEffect(() => {
        const handler = () => {
            if (document.fullscreenElement) {
                setPerms((p) => ({ ...p, fullscreen: 'granted' }));  // ← add this
            } else if (perms.fullscreen === 'granted') {
                setPerms((p) => ({ ...p, fullscreen: 'idle' }));
            }
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, [perms.fullscreen]);

    useEffect(() => {
        if (perms.webcam === 'granted' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
    }, [perms.webcam]);

    useEffect(() => {
        return () => {
            if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const handleStart = async () => {
        startMutation.mutate();
    };

    const startMutation = useMutation({
        mutationFn: () => startAssessment(assessment?._id as string),
        onSuccess: () => {
            navigate(`/assessments/${assessment?.id}/take`);
        },
        onError: (error: ApiResponse<null>) => {
            toast.error(error.responseMessage || 'Failed to start assessment');
        },
    });

    if (isLoading || !assessment) return <PageLoader />;

    const enableProctoring = assessment.requireWebcam || assessment.requireMicrophone || !assessment.allowTabSwitch || !assessment.allowFullscreenExit || assessment.enableRecording;

    const data = [
        { Icon: RiTimeLine, label: 'Duration', value: `${assessment.durationInMinutes} mins` },
        { Icon: RiAwardLine, label: 'Total Marks', value: String(assessment.totalMarks) },
        { Icon: MdQuiz, label: 'Questions', value: String(assessment.questions.length) },
        { Icon: RiBrainLine, label: 'Difficulty', value: assessment.difficulty },
    ]

    const rules = [
        { icon: RiEyeLine, iconClass: 'bg-warn-main/20 text-warn-dark', active: !assessment.allowTabSwitch, label: 'Switching tabs or leaving the window will be flagged as a violation. Too many violations will terminate your session.' },
        { icon: IoVideocam, active: assessment?.requireWebcam, iconClass: 'bg-error-main/20 text-error-dark', label: 'Your webcam will be active throughout the assessment for identity verification and proctoring.' },
        { icon: TbArrowsMaximize, iconClass: 'bg-muted-main text-text-light', active: !assessment.allowFullscreenExit, label: 'You must remain in fullscreen mode. Exiting fullscreen will be logged as a violation.' },
        { icon: BsDisplay, iconClass: 'bg-muted-main text-text-light', active: assessment.enableRecording, label: 'Screen recording may be active during this assessment for post-review purposes.' },
        { icon: FaMicrophone, iconClass: 'bg-primary-main/20 text-primary-dark', active: assessment?.requireMicrophone, label: 'Your microphone will be monitored to detect background noise and ensure academic integrity.' },
        { icon: TbBrowserX, active: true, iconClass: 'bg-secondary-main/20 text-secondary-dark', label: 'Do not refresh or close the browser during the assessment. Your progress may not be recoverable.' },
    ].filter((r) => r.active);

    const permHandlers: Record<keyof PermissionState, () => void> = {
        webcam: requestWebcam,
        microphone: requestMicrophone,
        fullscreen: requestFullscreen,
    };

    const permCards: PermCardProps[] = [
        {
            key: 'webcam',
            title: 'Camera Access',
            description: 'Required to verify your identity and monitor for policy violations during the exam.',
            icon: <IoVideocamOff className="w-5 h-5" />,
            activeIcon: <IoVideocam className="w-5 h-5" />,
            preview: (
                <div className="w-full aspect-video max-w-2xl mx-auto flex items-center justify-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>
            ),
        },
        {
            key: 'microphone',
            title: 'Microphone Access',
            description: 'Required to monitor audio environment and ensure no external assistance is present.',
            icon: <FaMicrophoneSlash className="w-5 h-5" />,
            activeIcon: <FaMicrophone className="w-5 h-5" />,
            preview: (
                <div className="p-3 space-y-1">
                    <p className="text-xs text-success-light mb-2">Microphone level</p>
                    <div className="w-full h-3 rounded-full bg-success-light/20 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-success-main transition-all duration-75"
                            style={{ width: `${micLevel}%` }}
                        />
                    </div>
                    <p className="text-xs text-success-main">Speak to test your microphone</p>
                </div>
            ),
        },
        {
            key: 'fullscreen',
            title: 'Fullscreen Mode',
            description:
                'The assessment must be taken in fullscreen. Exiting fullscreen will be logged as a violation.',
            icon: <TbArrowsMaximize className="w-5 h-5" />,
            activeIcon: <TbArrowsMaximize className="w-5 h-5" />,
        },
    ];

    const effectivePerms: PermissionState = {
        webcam: permissionConfig?.webcamRequired ? perms.webcam : 'not_required',
        microphone: permissionConfig?.microphoneRequired ? perms.microphone : 'not_required',
        fullscreen: permissionConfig?.fullscreenRequired ? perms.fullscreen : 'not_required',
    };

    const requiredPerms = (Object.keys(effectivePerms) as (keyof PermissionState)[])
        .filter((k) => effectivePerms[k] !== 'not_required');

    const grantedCount = requiredPerms.filter((k) => perms[k] === 'granted').length;
    const progressPct = requiredPerms.length > 0 ? (grantedCount / requiredPerms.length) * 100 : 100;

    const allChecked = Object.values(checks).every(Boolean);
    const allPermsGranted = requiredPerms.every((k) => perms[k] === 'granted');
    const canStart = allPermsGranted && allChecked;

    return (
        <Page>
            <div className="min-h-screen flex flex-col font-semibold py-10 px-4">
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

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* ── Left column: Permissions + Checklist ── */}
                        <div className="lg:col-span-3 space-y-6">
                            <ContentBox className='space-y-3'>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-bold">System Permissions</h2>
                                        <p className="text-xs">
                                            Grant all required permissions before you can begin.
                                        </p>
                                    </div>
                                    {/* Progress ring substitute */}
                                    <div className="tracking-widest">
                                        {grantedCount}/{requiredPerms.length}
                                    </div>
                                </div>

                                {/* Overall progress bar */}
                                <div className="w-full h-1 rounded-full bg-background-dark overflow-hidden">
                                    <div
                                        className={twMerge(
                                            'h-full rounded-full transition-all duration-500',
                                            progressPct === 100 ? 'bg-success-main' : 'bg-accent-main'
                                        )}
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>

                                {/* Permission cards */}
                                {permCards.map((card) => (
                                    <PermissionCard
                                        key={card.key}
                                        title={card.title}
                                        description={card.description}
                                        status={effectivePerms[card.key]}
                                        required={effectivePerms[card.key] !== 'not_required'}
                                        icon={card.icon}
                                        activeIcon={card.activeIcon}
                                        onRequest={permHandlers[card.key]}
                                        previewEl={card.preview}
                                    />
                                ))}

                                {allPermsGranted && (
                                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-background-main border border-success-light text-sm text-success-main font-semibold">
                                        <RiShieldCheckLine className="w-5 h-5 shrink-0" />
                                        All permissions granted — system check passed!
                                    </div>
                                )}
                            </ContentBox>

                            {/* Pre-flight checklist */}
                            <ContentBox className='space-y-2'>
                                <h2 className="font-bold">Before You Begin</h2>
                                <p className="text-xs">Confirm each item below to proceed.</p>

                                {CHECKLIST_ITEMS.map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <Input
                                            type="checkbox"
                                            checked={checks[item.key]}
                                            onChange={() => setChecks((p) => ({ ...p, [item.key]: !p[item.key] }))}
                                        />
                                        <span
                                            className={twMerge(
                                                'text-sm transition-colors',
                                                checks[item.key] ? 'text-text-light line-through' : 'text-text-main'
                                            )}>
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </ContentBox>
                        </div>

                        {/* ── Right column: Rules + CTA ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <ContentBox className='space-y-2'>
                                <h2 className="font-bold">Rules &amp; Guidelines</h2>
                                {rules.map((rule) => (
                                    <div key={rule.label} className="flex items-center gap-3 text-sm">
                                        <rule.icon className="w-5 h-5 shrink-0" />
                                        <span className="text-text-light leading-relaxed">{rule.label}</span>
                                    </div>
                                ))}
                            </ContentBox>

                            <ContentBox className='space-y-3'>
                                <div className="space-y-2">
                                    <h2 className="font-bold">Readiness Check</h2>
                                    <ReadinessRow
                                        label="Permissions"
                                        done={allPermsGranted}
                                        detail={
                                            allPermsGranted
                                                ? 'All granted'
                                                : `${grantedCount}/${requiredPerms.length} granted`
                                        }
                                    />
                                    <ReadinessRow
                                        label="Pre-flight checklist"
                                        done={allChecked}
                                        detail={
                                            allChecked
                                                ? 'All confirmed'
                                                : `${Object.values(checks).filter(Boolean).length}/${CHECKLIST_ITEMS.length} confirmed`
                                        }
                                    />
                                </div>

                                {!canStart && (
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-warn-light/20 border border-warn-light text-xs text-error-main">
                                        <RiInformationLine className="w-4 h-4 shrink-0" />
                                        <span>
                                            Ensure all prerequisites are fulfilled to avoid interruptions during the assessment.
                                        </span>
                                    </div>
                                )}

                                {/* Start button */}
                                <Button
                                    onClick={handleStart}
                                    disabled={!canStart}
                                    className={twMerge(
                                        'w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200',
                                        canStart
                                            ? 'bg-accent-main hover:bg-accent-dark text-text-inverse shadow-lg hover:scale-[1.02] active:scale-100'
                                            : 'bg-background-main text-text-light cursor-not-allowed'
                                    )}
                                >
                                    {startMutation.isPending ? (
                                        <>
                                            <RiLoader4Line className="w-5 h-5 animate-spin" />
                                            Starting…
                                        </>
                                    ) : (
                                        <>
                                            <RiPlayCircleLine className="w-5 h-5" />
                                            Begin Assessment
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-error-main">
                                    ⚠ Timer starts immediately when you click Begin
                                </p>
                            </ContentBox>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default AssessmentLobby;