import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { TbAlertTriangleFilled } from 'react-icons/tb';

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
    console.log(violationCount, maxViolations)
    return (
        <Modal
            isOpen={isOpen}
            onClose={onDismiss}
            title="Warning"
            maxWidth="sm"
            className="border border-warn-light"
        >
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-full text-warn-main flex items-center justify-center shrink-0">
                        <TbAlertTriangleFilled className='w-8 h-8' />
                    </div>

                    <p className="text-lg font-semibold">
                        Violation
                    </p>
                </div>

                {/* Message */}
                <p className="text-sm leading-relaxed">
                    {message}
                </p>

                {/* Action */}
                <Button
                    onClick={onDismiss}
                    className="w-full py-2.5 rounded-xl bg-warn-main hover:bg-warn-dark text-text-inverse font-semibold text-sm"
                >
                    I Understand – Continue Assessment
                </Button>
            </div>
        </Modal >
    );
};

export default WarningModal;