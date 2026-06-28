import React from 'react';
import Modal from '../ui/Modal';

interface SubmitModalProps {
    isOpen: boolean;
    totalQuestions: number;
    answeredCount: number;
    flaggedCount: number;
    isAutoSubmit?: boolean;
    isSubmitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({
    isOpen,
    totalQuestions,
    answeredCount,
    flaggedCount,
    isAutoSubmit = false,
    isSubmitting,
    onConfirm,
    onCancel,
}) => {
    const unanswered = totalQuestions - answeredCount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title={isAutoSubmit ? "Time's Up!" : 'Submit Assessment'}
            maxWidth="md"
        >
            <div className="space-y-5">
                {/* Subtitle */}
                <p className="text-xs text-slate-500">
                    {isAutoSubmit
                        ? 'Your assessment is being submitted automatically.'
                        : 'Please review before submitting.'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-2xl font-bold text-slate-800">{totalQuestions}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Total</p>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <p className="text-2xl font-bold text-emerald-600">{answeredCount}</p>
                        <p className="text-xs text-emerald-500 mt-0.5">Answered</p>
                    </div>

                    <div className="text-center p-3 rounded-xl bg-red-50 border border-red-100">
                        <p className="text-2xl font-bold text-red-500">{unanswered}</p>
                        <p className="text-xs text-red-400 mt-0.5">Unanswered</p>
                    </div>
                </div>

                {/* Flagged */}
                {flaggedCount > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                        <span>
                            <strong>{flaggedCount}</strong> question
                            {flaggedCount > 1 ? 's' : ''} flagged for review
                        </span>
                    </div>
                )}

                {/* Unanswered warning */}
                {unanswered > 0 && !isAutoSubmit && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                        <span>
                            You have <strong>{unanswered}</strong> unanswered question
                            {unanswered > 1 ? 's' : ''}. Unanswered questions score 0.
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!isAutoSubmit && (
                        <button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            Review Answers
                        </button>
                    )}

                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                </svg>
                                Submitting…
                            </>
                        ) : (
                            'Submit Assessment'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SubmitModal;