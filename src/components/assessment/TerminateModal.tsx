import React from 'react';
import Modal from '../ui/Modal';
import { FaBan } from 'react-icons/fa';
import Button from '../ui/Button';

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
            className="border border-error-light/50"
        >
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-full text-error-main flex items-center justify-center shrink-0">
                        <FaBan className='w-8 h-8' />
                    </div>

                    <p className="text-lg font-semibold">
                        Proctoring violation limit exceeded
                    </p>
                </div>

                {/* Reason */}
                <p className="text-sm leading-relaxed">
                    {reason}
                </p>

                {/* Info */}
                <div className="text-error-dark border border-error-light/50 rounded-xl p-3 text-sm">
                    Your progress has been recorded. Please contact your administrator.
                </div>

                {/* Action */}
                <Button
                    size='md'
                    onClick={onExit} variant='danger'
                    className="w-full rounded-xl"
                >
                    Exit Assessment
                </Button>
            </div>
        </Modal>
    );
};

export default TerminateModal;