import React from 'react';
import Modal from '../ui/Modal';
import moment from 'moment';
import { PiCheckBold } from "react-icons/pi";
import Button from '../ui/Button';

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
                <div className="w-20 h-20 mx-auto rounded-full bg-background-dark border border-border-light flex items-center justify-center">
                    <PiCheckBold className="w-10 h-10 text-success-main" />
                </div>

                {/* Title */}
                <div>
                    <p className="text-sm text-text-light font-semibold">{title}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl text-success-main bg-background-main border border-border-light">
                        <p className="text-xl font-bold">{answeredCount}</p>
                        <p className="text-xs">Answered</p>
                    </div>

                    <div className="p-3 rounded-xl text-accent-main bg-background-main border border-border-light">
                        <p className="text-xl font-bold">{pct}%</p>
                        <p className="text-xs">Completion</p>
                    </div>

                    <div className="p-3 rounded-xl text-warn-main bg-background-main border border-border-light">
                        <p className="text-xl font-bold">
                            {moment
                                .utc(moment.duration(timeSpentSeconds, 'seconds').asMilliseconds())
                                .format('HH:mm')}
                        </p>
                        <p className="text-xs">Time</p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-sm text-text-light">
                    Your responses have been recorded. Results will be shared after evaluation.
                </p>

                {/* Action */}
                <Button
                    size='md' variant='accent'
                    onClick={onExit}
                    className="w-full rounded-xl"
                >
                    Back to Dashboard
                </Button>
            </div>
        </Modal>
    );
};

export default SuccessModal;