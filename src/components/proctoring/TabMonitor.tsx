import React, { useState, useEffect, useCallback } from 'react';
import { MdWarning, MdError } from 'react-icons/md';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TabMonitorProps {
    maxSwitches: number;
    onViolation: (count: number) => void;
    onTerminate: () => void;
}

const TabMonitor: React.FC<TabMonitorProps> = ({
    maxSwitches,
    onViolation,
    onTerminate,
}) => {
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [warningOpen, setWarningOpen] = useState(false);
    const [terminateOpen, setTerminateOpen] = useState(false);

    // Track visibility changes
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            // Tab switched or window minimized
            const newCount = tabSwitchCount + 1;
            setTabSwitchCount(newCount);
            setIsVisible(false);

            if (newCount <= maxSwitches) {
                onViolation(newCount);

                if (newCount === maxSwitches) {
                    // Final warning
                    setWarningOpen(true);
                } else if (newCount > maxSwitches) {
                    // Terminate assessment
                    setTerminateOpen(true);
                    onTerminate();
                }
            }
        } else {
            setIsVisible(true);
        }
    }, [tabSwitchCount, maxSwitches, onViolation, onTerminate]);

    // Track blur events (for older browsers)
    const handleBlur = useCallback(() => {
        if (document.activeElement?.tagName === 'IFRAME') {
            return; // Ignore iframe focus
        }
        handleVisibilityChange();
    }, [handleVisibilityChange]);

    // Setup event listeners
    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', () => setIsVisible(true));

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', () => setIsVisible(true));
        };
    }, [handleVisibilityChange, handleBlur]);

    // Auto-close warnings
    useEffect(() => {
        if (warningOpen) {
            const timer = setTimeout(() => {
                setWarningOpen(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [warningOpen]);

    // Force terminate after final warning
    useEffect(() => {
        if (tabSwitchCount > maxSwitches) {
            const timer = setTimeout(() => {
                onTerminate();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [tabSwitchCount, maxSwitches, onTerminate]);

    return (
        <>
            {/* Tab Switch Counter Display */}
            <div className="fixed top-4 right-4 z-50">
                <div className={`px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm ${isVisible ? 'bg-success-light/10 border-success-main/30 text-success-dark' : 'bg-error-light/10 border-error-main/30 text-error-dark'}`}>
                    <div className="flex items-center text-xs font-semibold uppercase tracking-wider mb-1">
                        {isVisible ? (
                            <>
                                <span className="w-2 h-2 bg-success-main rounded-full mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                {' '}Window Active
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 bg-error-main rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                {' '}Window Inactive
                            </>
                        )}
                    </div>
                    <div className="font-bold text-lg">
                        Tab Switches: {tabSwitchCount}/{maxSwitches}
                    </div>
                </div>
            </div>

            {/* Warning Dialog */}
            <Modal
                isOpen={warningOpen}
                onClose={() => setWarningOpen(false)}
                title="Final Warning text-warn-main"
                maxWidth="md"
            >
                <div className="flex flex-col space-y-4 pt-2">
                    <div className="flex items-center text-warn-main gap-2 text-lg font-semibold">
                        <MdWarning className="text-2xl" />
                        Final Warning
                    </div>
                    <div>
                        <p className="text-text-main">
                            You have switched tabs/windows font-bold {tabSwitchCount} times.
                            If you switch tabs again, your assessment will be terminated automatically.
                        </p>
                        <p className="mt-2 text-text-light text-sm">
                            Please remain in this window for the duration of the assessment.
                        </p>
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t border-border-light">
                        <Button onClick={() => setWarningOpen(false)} variant="primary" size="md">
                            Acknowledge
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Termination Dialog */}
            <Modal
                isOpen={terminateOpen}
                onClose={() => setTerminateOpen(false)}
                title="Assessment Terminated text-error-main"
                maxWidth="sm"
            >
                <div className="flex flex-col space-y-4 pt-2">
                    <div className="flex items-center text-error-main gap-2 text-lg font-semibold">
                        <MdError className="text-2xl" />
                        Terminated
                    </div>
                    <div>
                        <p className="text-text-main font-medium">
                            Your assessment has been terminated due to excessive tab/window switching.
                        </p>
                        <p className="mt-2 text-text-light text-sm">
                            You switched tabs/windows {tabSwitchCount} times, exceeding the maximum allowed ({maxSwitches}).
                        </p>
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t border-border-light">
                        <Button onClick={onTerminate} variant="danger" size="md">
                            Close Assessment
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Full Screen Warning */}
            {!isVisible && tabSwitchCount <= maxSwitches && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
                    <div className="bg-background-light rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-warn-main/20 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-warn-light/20 text-warn-main rounded-full">
                                <MdWarning className="text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-dark">
                                Return to Assessment
                            </h2>
                            <div className="space-y-2 text-text-main">
                                <p>
                                    Please return to the assessment window immediately.
                                    This is your warning <span className="font-bold text-warn-dark">{tabSwitchCount}</span> out of <span className="font-bold">{maxSwitches}</span>.
                                </p>
                                <p className="text-sm border-t border-border-light pt-3 text-text-light">
                                    Further switching away from this tab will result in automatic termination.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TabMonitor;