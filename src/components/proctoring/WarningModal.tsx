import React from 'react';
import { MdWarning } from 'react-icons/md';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    tabSwitchCount: number;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onClose, tabSwitchCount }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Final Warning"
            maxWidth="md"
        >
            <div className="flex flex-col space-y-4 pt-2">
                <div className="flex items-center text-warn-main gap-2 text-lg font-semibold">
                    <MdWarning className="text-2xl" />
                    Final Warning
                </div>
                <div>
                    <p className="text-text-main">
                        You have switched tabs/windows <span className="font-bold">{tabSwitchCount}</span> times.
                        If you switch tabs again, your assessment will be terminated automatically.
                    </p>
                    <p className="mt-2 text-text-light text-sm">
                        Please remain in this window for the duration of the assessment.
                    </p>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t border-border-light">
                    <Button onClick={onClose} variant="primary" size="md">
                        Acknowledge
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default WarningModal;
