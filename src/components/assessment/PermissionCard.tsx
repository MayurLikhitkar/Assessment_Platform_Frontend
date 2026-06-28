import { twMerge } from "tailwind-merge";
import Button from "../ui/Button";
import { RiCheckLine, RiLoader4Line, RiErrorWarningLine, RiShieldCheckLine, RiRefreshLine } from 'react-icons/ri';


export type PermStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'not_required';

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

const STATUS_META: Record<PermStatus, { label: string; color: string; bg: string; border: string }> = {
    idle: {
        label: 'Not checked',
        color: 'text-text-main',
        bg: 'bg-background-main',
        border: 'border-border-light',
    },
    checking: {
        label: 'Checking…',
        color: 'text-text-light',
        bg: 'bg-secondary-light/10',
        border: 'border-secondary-light/30',
    },
    granted: {
        label: 'Granted',
        color: 'text-success-main',
        bg: 'bg-success-light/20',
        border: 'border-success-light/50',
    },
    denied: {
        label: 'Denied',
        color: 'text-error-main',
        bg: 'bg-error-light/30',
        border: 'border-error-light/50',
    },
    not_required: {
        label: 'Not required',
        color: 'text-text-light',
        bg: 'bg-background-main',
        border: 'border-border-light',
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
                        <p className="text-xs text-text-light mt-0.5">{description}</p>
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

export default PermissionCard;