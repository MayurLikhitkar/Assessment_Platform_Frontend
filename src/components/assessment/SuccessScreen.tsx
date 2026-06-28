import React from 'react';
import Modal from '../ui/Modal';
import moment from 'moment';

interface SuccessModalProps {
    isOpen: boolean;
    title: string;
    answeredCount: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    onExit: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    title,
    answeredCount,
    totalQuestions,
    timeSpentSeconds,
    onExit,
}) => {
    const pct = Math.round((answeredCount / totalQuestions) * 100);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onExit}
            title="Assessment Submitted!"
            maxWidth="md"
        >
            <div className="text-center space-y-6">

                {/* Checkmark */}
                <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border">
                        <p className="text-xl font-bold">{answeredCount}</p>
                        <p className="text-xs text-slate-500">Answered</p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50 border">
                        <p className="text-xl font-bold text-indigo-600">{pct}%</p>
                        <p className="text-xs text-indigo-400">Completion</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border">
                        <p className="text-sm font-bold">
                            {moment
                                .utc(moment.duration(timeSpentSeconds, 'seconds').asMilliseconds())
                                .format('HH:mm:ss')}
                        </p>
                        <p className="text-xs text-slate-500">Time</p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-sm text-slate-500">
                    Your responses have been recorded. Results will be shared after evaluation.
                </p>

                {/* Action */}
                <button
                    onClick={onExit}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm"
                >
                    Back to Dashboard
                </button>
            </div>
        </Modal>
    );
};

export default SuccessModal;