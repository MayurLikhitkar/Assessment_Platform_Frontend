import React from 'react';
import Modal from '../ui/Modal';

interface WarningModalProps {
    isOpen: boolean;
    message: string;
    violationCount: number;
    maxViolations: number;
    onDismiss: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
    isOpen,
    message,
    violationCount,
    maxViolations,
    onDismiss,
}) => {
    const progress = (violationCount / maxViolations) * 100;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onDismiss}
            title="Proctoring Warning"
            maxWidth="md"
            className="border border-amber-200"
        >
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <svg
                            className="w-6 h-6 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            />
                        </svg>
                    </div>

                    <div>
                        <p className="text-xs text-amber-600 font-medium">
                            Violation {violationCount} of {maxViolations} allowed
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Violations</span>
                        <span>
                            {violationCount}/{maxViolations}
                        </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-700 leading-relaxed">
                    {message}
                </p>

                {/* Action */}
                <button
                    onClick={onDismiss}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm"
                >
                    I Understand – Continue Assessment
                </button>
            </div>
        </Modal>
    );
};

export default WarningModal;