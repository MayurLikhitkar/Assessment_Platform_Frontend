import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { RiTimeLine, RiEyeLine, RiPlayCircleLine, RiInformationLine, RiCheckLine, RiAwardLine, RiBrainLine, RiLoader4Line, RiErrorWarningLine, RiShieldCheckLine, RiRefreshLine } from 'react-icons/ri';
import { Page, ContentBox } from '../../../components/ui/Page';
import Button from '../../../components/ui/Button';
import PageLoader from '../../../components/common/PageLoader';
import { getAssessment, startAssessment } from '../../../services/axios/userApi';
import { MdQuiz } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { TbArrowsMaximize, TbBrowserX } from 'react-icons/tb';
import { IoVideocam, IoVideocamOff } from 'react-icons/io5';
import { BsDisplay } from 'react-icons/bs';

// ── Types ────────────────────────────────────────────────────────────────────

type ChecklistKey = 'connection' | 'environment' | 'rules';

interface ChecklistItem {
    key: ChecklistKey;
    label: string;
}

type PermStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'not_required';

interface PermissionState {
    webcam: PermStatus;
    microphone: PermStatus;
    fullscreen: PermStatus;
}

interface PermissionCardProps {
    title: string;
    description: string;
    status: PermStatus;
    required: boolean;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    onRequest: () => void;
    previewEl?: React.ReactNode;
}

interface PermCardProps {
    key: keyof PermissionState;
    title: string;
    description: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    preview?: React.ReactNode;
}

const STATUS_META: Record<PermStatus, { label: string; color: string; bg: string; border: string }> = {
    idle: {
        label: 'Not checked',
        color: 'text-slate-500',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
    },
    checking: {
        label: 'Checking…',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
    },
    granted: {
        label: 'Granted',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
    },
    denied: {
        label: 'Denied',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
    },
    not_required: {
        label: 'Not required',
        color: 'text-slate-400',
        bg: 'bg-slate-50',
        border: 'border-slate-100',
    },
};

const PermissionCard: React.FC<PermissionCardProps> = ({ title, description, status, required, icon, activeIcon, onRequest, previewEl,
}) => {
    if (!STATUS_META[status]) {
        console.warn(`PermissionCard received unknown status: "${status}"`);
    }

    const meta = STATUS_META[status] ?? STATUS_META['idle'];

    return (
        <div
            className={twMerge(
                'rounded-xl border p-4 flex flex-col gap-4 transition-all duration-200',
                meta.bg,
                meta.border,
                !required && 'opacity-60'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={twMerge(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            status === 'granted' ? 'bg-background-main text-success-main' : 'bg-background-light text-text-light border border-border-light'
                        )}
                    >
                        {status === 'granted' ? activeIcon : icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm">{title}</h3>
                            {required ? (
                                <span className="text-xs uppercase tracking-wide px-1 border border-error-light/50 rounded bg-error-light/20 text-error-dark">
                                    Required
                                </span>
                            ) : (
                                <span className="text-xs uppercase tracking-wide px-1 py-1 rounded bg-success-light/20 text-success-dark">
                                    Optional
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                </div>

                {/* Status badge */}
                <div
                    className={twMerge(
                        'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shrink-0',
                        meta.color,
                        meta.bg,
                        meta.border
                    )}
                >
                    {status === 'checking' && <RiLoader4Line className="w-4 h-4 animate-spin" />}
                    {status === 'granted' && <RiCheckLine className="w-4 h-4" />}
                    {status === 'denied' && <RiErrorWarningLine className="w-4 h-4" />}
                    {meta.label}
                </div>
            </div>

            {/* Webcam preview */}
            {previewEl && status === 'granted' && (
                <div className="rounded-xl overflow-hidden border border-border-light bg-background-inverse">
                    {previewEl}
                </div>
            )}

            {/* Actions */}
            {status !== 'not_required' && (
                <div className="flex items-center gap-2">
                    {status === 'idle' && required && (
                        <Button
                            onClick={onRequest}
                            className="w-full bg-accent-main hover:bg-accent-dark text-text-inverse transition-colors"
                        >
                            Grant Permission
                        </Button>
                    )}
                    {status === 'checking' && (
                        <Button
                            disabled
                            className="flex-1 py-2 px-4 rounded-xl bg-warn-light/10 text-warn-main text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                            <RiLoader4Line className="w-4 h-4 animate-spin" /> Requesting…
                        </Button>
                    )}
                    {status === 'granted' && (
                        <div className="flex-1 flex items-center gap-2 text-sm text-success-main">
                            <RiShieldCheckLine className="w-4 h-4" /> Access confirmed
                        </div>
                    )}
                    {status === 'denied' && (
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="text-xs text-error-dark bg-error-light/30 border border-error-main rounded-lg p-2">
                                Permission was denied. Please allow access in your browser settings, then retry.
                            </div>
                            <Button
                                onClick={onRequest}
                                variant='danger' className='w-full'>
                                <RiRefreshLine className="w-4 h-4" /> Retry
                            </Button>
                        </div>
                    )}
                    {status === 'idle' && !required && (
                        <Button
                            onClick={onRequest}
                            className="w-full bg-background-light hover:bg-background-light/90 text-sm"
                        >
                            Grant Permission
                        </Button>
                    )}
                </div>
            )}

            {status === 'not_required' && (
                <p className="text-xs text-text-light italic">This permission is not required for this assessment.</p>
            )}
        </div>
    );
};

const ReadinessRow: React.FC<{ label: string; done: boolean; detail: string }> = ({ label, done, detail }) => (
    <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
            <span
                className={twMerge(
                    'w-4 h-4 rounded-full flex items-center justify-center',
                    done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                )}
            >
                {done ? <RiCheckLine className="w-2.5 h-2.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 block" />}
            </span>
            <span className="text-slate-600 font-medium">{label}</span>
        </div>
        <span className={twMerge('font-semibold', done ? 'text-emerald-600' : 'text-slate-400')}>{detail}</span>
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
        webcam: assessment?.requireWebcam ? 'idle' : 'not_required',
        microphone: assessment?.requireMicrophone ? 'idle' : 'not_required',
        fullscreen: assessment?.allowFullscreenExit ? 'not_required' : 'idle',
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

    const [isStarting, setIsStarting] = useState(false);
    const [started, setStarted] = useState(false);

    const requiredPerms = (Object.keys(perms) as (keyof PermissionState)[]).filter(
        (k) => perms[k] !== 'not_required'
    );

    const allPermsGranted = requiredPerms.every((k) => perms[k] === 'granted');
    const allChecked = Object.values(checks).every(Boolean);
    const canStart = allPermsGranted && allChecked;

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

    useEffect(() => {
        return () => {
            if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const handleStart = async () => {
        setIsStarting(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));
        setIsStarting(false);
        setStarted(true);
    };

    const startMutation = useMutation({
        mutationFn: () => startAssessment(assessment?._id as string),
        onSuccess: () => {
            navigate(`/assessments/${id}/take`);
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to start assessment');
        },
    });

    if (started) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center">
                        <RiPlayCircleLine className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Assessment Started!</h1>
                    <p className="text-slate-400">Good luck. Timer is now running.</p>
                </div>
            </div>
        );
    }

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
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-36 object-cover rounded-xl"
                />
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
                    <p className="text-xs text-emerald-300 font-medium mb-2">Microphone level</p>
                    <div className="w-full h-3 rounded-full bg-emerald-950 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-75"
                            style={{ width: `${micLevel}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-emerald-500">Speak to test your microphone</p>
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

    const grantedCount = requiredPerms.filter((k) => perms[k] === 'granted').length;
    const progressPct = requiredPerms.length > 0 ? (grantedCount / requiredPerms.length) * 100 : 100;

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
                                        status={perms[card.key]}
                                        required={perms[card.key] !== 'not_required'}
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
                            <ContentBox>
                                <h2 className="font-bold">Before You Begin</h2>
                                <p className="text-xs">Confirm each item below to proceed.</p>

                                <div className="space-y-3">
                                    {CHECKLIST_ITEMS.map((item) => (
                                        <button
                                            key={item.key}
                                            onClick={() => setChecks((p) => ({ ...p, [item.key]: !p[item.key] }))}
                                            className="w-full flex items-center gap-3 text-sm text-left group"
                                        >
                                            <span
                                                className={twMerge(
                                                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150',
                                                    checks[item.key]
                                                        ? 'bg-success-main border-success-light text-text-inverse'
                                                        : 'border-border-main bg-background-main group-hover:border-border-dark'
                                                )}
                                            >
                                                {checks[item.key] && <RiCheckLine className="w-3 h-3" />}
                                            </span>
                                            <span
                                                className={twMerge(
                                                    'transition-colors',
                                                    checks[item.key] ? 'text-text-light line-through' : 'text-text-main'
                                                )}
                                            >
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </ContentBox>
                        </div>

                        {/* ── Right column: Rules + CTA ── */}
                        <div className="lg:col-span-2 space-y-6">
                            <ContentBox className='space-y-2'>
                                <h2 className="font-bold">Rules &amp; Guidelines</h2>
                                {rules.map((rule, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <rule.icon className="w-5 h-5 shrink-0" />
                                        <span className="text-slate-600 leading-relaxed">{rule.label}</span>
                                    </div>
                                ))}
                            </ContentBox>

                            {/* CTA sticky-ish card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 lg:sticky lg:top-20">
                                {/* Readiness summary */}
                                <div className="space-y-2">
                                    <h2 className="font-bold text-slate-800 text-sm">Readiness Check</h2>
                                    <div className="space-y-1.5">
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
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Warning */}
                                {!canStart && (
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                                        <RiInformationLine className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>
                                            Complete all permission checks and the pre-flight checklist to unlock the Start button.
                                        </span>
                                    </div>
                                )}

                                {/* Start button */}
                                <button
                                    onClick={handleStart}
                                    disabled={!canStart || isStarting}
                                    className={twMerge(
                                        'w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200',
                                        canStart && !isStarting
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-100'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    )}
                                >
                                    {isStarting ? (
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
                                </button>

                                <p className="text-center text-[11px] text-red-500 font-medium">
                                    ⚠ Timer starts immediately when you click Begin
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default AssessmentLobby;