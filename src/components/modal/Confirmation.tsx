import React from 'react'
import Button from '../ui/Button';
import Modal, { type ModalProps } from '../ui/Modal';
import type { IconType } from 'react-icons/lib';

interface ConfirmationProps extends Omit<ModalProps, 'children'> {
    onConfirm: () => void;
    message?: string
    icon?: IconType
    confirmText?: string
    cancelText?: string
    children?: React.ReactNode
}

const Confirmation: React.FC<ConfirmationProps> = ({ onConfirm, onClose, title = 'Confirmation', message, icon: Icon, confirmText = 'Confirm', cancelText = 'Cancel', children, ...props }) => {
    return (
        <Modal {...props} title={title} onClose={onClose}>
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                {Icon && <Icon className="text-5xl text-primary-main" />}
                <div className="text-text-main text-lg font-medium px-4">
                    {children || message}
                </div>
                <div className="flex w-full justify-center gap-4 pt-6 mt-4">
                    <Button variant="success" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                    <Button variant="glass" onClick={onClose}>
                        {cancelText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}


export default Confirmation;