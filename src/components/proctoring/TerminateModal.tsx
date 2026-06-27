import React from 'react';
import Modal from '../ui/Modal';

interface TerminateModalProps {
    isOpen: boolean;
    reason: string;
    onExit: () => void;
}

const TerminateModal: React.FC<TerminateModalProps> = ({
    isOpen,
    reason,
    onExit,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { }} // prevent closing
            title="Assessment Terminated"
            maxWidth="md"
            className="border border-red-200"
        >
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636"
                            />
                        </svg>
                    </div>

                    <div>
                        <p className="text-xs text-red-500 font-medium">
                            Proctoring violation limit exceeded
                        </p>
                    </div>
                </div>

                {/* Reason */}
                <p className="text-sm text-slate-700 leading-relaxed">
                    {reason}
                </p>

                {/* Info */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700">
                    Your progress has been recorded. Please contact your administrator.
                </div>

                {/* Action */}
                <button
                    onClick={onExit}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm"
                >
                    Exit Assessment
                </button>
            </div>
        </Modal>
    );
};

export default TerminateModal;