import React from 'react'
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { IconType } from 'react-icons/lib';

interface ConfirmationProps {
    open: boolean
    onClose: () => void;
    onConfirm: () => void;
    message: string
    icon?: IconType
    confirmText?: string
    cancelText?: string
}

const Confirmation: React.FC<ConfirmationProps> = ({ open, onClose, onConfirm, message, icon: Icon, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    return (
        <Modal isOpen={open} onClose={onClose} title="Confirmation" maxWidth="sm">
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                {Icon && <Icon className="text-5xl text-primary-main" />}
                <p className="text-text-main text-lg font-medium px-4">
                    {message}
                </p>
                <div className="flex w-full justify-center gap-4 pt-6 mt-4">
                    <Button size="md" variant="success" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                    <Button size="md" variant="danger" onClick={onClose}>
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}


export default Confirmation;