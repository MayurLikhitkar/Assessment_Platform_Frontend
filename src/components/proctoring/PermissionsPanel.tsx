import type { AssessmentInterface } from "../../types/assessmentTypes";
import { RiVideoLine, RiMicLine, RiComputerLine, RiCheckLine, RiShieldCheckLine, RiInformationLine, RiArrowRightLine } from "react-icons/ri";
import { ContentBox } from "../ui/Page";
import { twMerge } from "tailwind-merge";
import Button from "../ui/Button";
import { IoVideocam } from "react-icons/io5";
import { useEffect, useRef } from "react";

export type PermKey = 'webcam' | 'mic' | 'screen';
export type PermStatus = 'pending' | 'granted' | 'denied' | 'skipped';

interface PermissionsPanelProps {
    assessment: AssessmentInterface;
    permState: Record<PermKey, PermStatus>;
    onRequestPerms: () => void;
    onNext: () => void;
    camStream: MediaStream | null;
    isRequesting: boolean;
}

interface PermRowProps {
    icon: React.ReactNode;
    iconClass: string;
    label: string;
    description: string;
    status: PermStatus;
    required: boolean;
}

const PermRow: React.FC<PermRowProps> = ({ icon, iconClass, label, description, status, required }) => {
    const badge = () => {
        if (!required) return (
            <span className="text-[11px] text-text-light italic border border-border-light rounded-full px-2.5 py-0.5">
                Not required
            </span>
        );
        if (status === 'granted') return (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-success-dark bg-success-light/20 border border-success-light rounded-full px-2.5 py-0.5">
                <RiCheckLine className="w-3 h-3" /> Allowed
            </span>
        );
        if (status === 'denied') return (
            <span className="text-[11px] font-semibold text-error-dark bg-error-light/20 border border-error-light rounded-full px-2.5 py-0.5">
                Blocked
            </span>
        );
        return (
            <span className="text-[11px] text-text-light bg-muted-light border border-border-light rounded-full px-2.5 py-0.5">
                Pending
            </span>
        );
    };

    return (
        <div className="flex items-center gap-3 py-3 border-b border-border-light last:border-none">
            <div className={twMerge('w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconClass)}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-main">{label}</p>
                <p className="text-xs text-text-light mt-0.5">{description}</p>
            </div>
            <div className="shrink-0">{badge()}</div>
        </div>
    );
};

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({
    assessment, permState, onRequestPerms, onNext, camStream, isRequesting,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current || !camStream) return;

        videoRef.current.srcObject = camStream;
    }, [camStream]);

    const perms: { key: PermKey; label: string; description: string; icon: React.ReactNode; iconClass: string; required: boolean }[] = [
        {
            key: 'webcam',
            label: 'Camera',
            description: 'Used for identity verification throughout the assessment',
            icon: <RiVideoLine className="w-4 h-4" />,
            iconClass: 'bg-error-light/20 text-error-dark',
            required: assessment.requireWebcam,
        },
        {
            key: 'mic',
            label: 'Microphone',
            description: 'Monitored to detect ambient audio anomalies',
            icon: <RiMicLine className="w-4 h-4" />,
            iconClass: 'bg-warn-light/20 text-warn-dark',
            required: assessment.requireMicrophone,
        },
        {
            key: 'screen',
            label: 'Screen activity',
            description: 'Tab/window switching is tracked automatically — no extra permission needed',
            icon: <RiComputerLine className="w-4 h-4" />,
            iconClass: 'bg-primary-light/20 text-primary-dark',
            required: !assessment.allowTabSwitch,
        },
    ];

    const requiredGranted = perms
        .filter(p => p.required)
        .every(p => permState[p.key] === 'granted');

    const hasDenied = perms.some(p => p.required && permState[p.key] === 'denied');
    const camGranted = permState.webcam === 'granted';

    return (
        <>
            <ContentBox className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-light">
                    Permissions required
                </h2>

                {/* Camera preview */}
                {assessment.requireWebcam && (
                    <div className="relative bg-muted-light rounded-xl overflow-hidden h-40 border border-border-light">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={twMerge('w-full h-full object-cover', !camGranted && 'hidden')}
                        />
                        {!camGranted && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-light gap-2">
                                <IoVideocam className="w-8 h-8 opacity-40" />
                                <p className="text-xs">Camera preview will appear here</p>
                            </div>
                        )}
                        {camGranted && (
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-success-main/15 text-success-dark text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-success-main animate-pulse" />
                                Live
                            </div>
                        )}
                    </div>
                )}

                {/* Permission rows */}
                <div>
                    {perms.map(p => (
                        <PermRow
                            key={p.key}
                            icon={p.icon}
                            iconClass={p.iconClass}
                            label={p.label}
                            description={p.description}
                            status={permState[p.key]}
                            required={p.required}
                        />
                    ))}
                </div>

                {/* Grant button */}
                {!requiredGranted && (
                    <Button
                        variant="primary"
                        onClick={onRequestPerms}
                        loading={isRequesting}
                        disabled={isRequesting}
                        className="w-full justify-center py-2.5 gap-2 rounded-xl text-sm"
                    >
                        <RiShieldCheckLine className="w-4 h-4" />
                        {isRequesting ? 'Requesting…' : 'Grant permissions'}
                    </Button>
                )}

                {/* Denied error */}
                {hasDenied && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-error-light/10 border border-error-light text-error-dark text-xs">
                        <RiInformationLine className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                            One or more permissions were blocked. Please reset camera/microphone access in your browser settings and try again.
                        </span>
                    </div>
                )}
            </ContentBox>

            <Button
                variant={requiredGranted ? 'primary' : 'custom'}
                disabled={!requiredGranted}
                onClick={onNext}
                className={twMerge(
                    'w-full justify-center py-3 gap-2 rounded-xl text-sm',
                    !requiredGranted && 'opacity-40 cursor-not-allowed bg-muted-main border border-border-main',
                )}
            >
                Continue <RiArrowRightLine className="w-4 h-4" />
            </Button>
            <p className="text-center text-[11px] text-text-light mt-1.5">
                All required permissions must be granted to continue
            </p>
        </>
    );
};

export default PermissionsPanel;