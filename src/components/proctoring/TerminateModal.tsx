import React from 'react';
import { MdError } from 'react-icons/md';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TerminateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTerminate: () => void;
    tabSwitchCount: number;
    maxSwitches: number;
}

const TerminateModal: React.FC<TerminateModalProps> = ({ isOpen, onClose, onTerminate, tabSwitchCount, maxSwitches }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assessment Terminated"
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
    );
};

export default TerminateModal;
