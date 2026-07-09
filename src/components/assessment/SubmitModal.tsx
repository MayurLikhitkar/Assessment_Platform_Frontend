import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

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
                <p className="text-xs text-text-light">
                    {isAutoSubmit
                        ? 'Your assessment is being submitted automatically.'
                        : 'Please review before submitting.'}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-background-main border border-border-light">
                        <p className="text-2xl font-bold">{totalQuestions}</p>
                        <p className="text-xs">Total</p>
                    </div>

                    <div className="text-center text-success-main p-3 rounded-xl bg-background-main border border-border-light">
                        <p className="text-2xl font-bold">{answeredCount}</p>
                        <p className="text-xs">Answered</p>
                    </div>

                    <div className="text-center text-error-main p-3 rounded-xl bg-background-main border border-border-light">
                        <p className="text-2xl font-bold">{unanswered}</p>
                        <p className="text-xs">Unanswered</p>
                    </div>
                </div>

                {/* Flagged */}
                {flaggedCount > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-background-main border border-border-light text-sm text-warn-dark">
                        <span>
                            You flagged <strong>{flaggedCount}</strong> question
                            {flaggedCount > 1 ? 's' : ''} for review
                        </span>
                    </div>
                )}

                {/* Unanswered warning */}
                {unanswered > 0 && !isAutoSubmit && (
                    <div className="flex items-center gap-2 p-3 rounded-xl border border-warn-light text-sm bg-warn-light/30">
                        <span>
                            You have <strong>{unanswered}</strong> unanswered question
                            {unanswered > 1 ? 's' : ''}. Unanswered questions score 0.
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    {!isAutoSubmit && (
                        <Button
                            onClick={onCancel}
                            disabled={isSubmitting}
                            variant='glass'
                            size='md'
                            className='rounded-xl'
                        >
                            Review Answers
                        </Button>
                    )}

                    <Button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        variant='accent'
                        size='md'
                        className='rounded-xl'
                    >
                        {isSubmitting ? (
                            'Submitting…'
                        ) : (
                            'Submit Assessment'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SubmitModal;