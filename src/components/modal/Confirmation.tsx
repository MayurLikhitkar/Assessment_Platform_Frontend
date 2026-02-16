import { Dialog, DialogActions, DialogContent, DialogTitle, type DialogProps } from '@mui/material';
import React from 'react'
import Button from '../ui/Button';
import type { IconType } from 'react-icons/lib';

interface ConfirmationProps extends DialogProps {
    open: boolean
    onClose: () => void;
    onConfirm: () => void;
    message: string
    icon?: IconType
    confirmText?: string
    cancelText?: string
}

const Confirmation: React.FC<ConfirmationProps> = ({ open, onClose, onConfirm, message, icon: Icon, confirmText = 'Confirm', cancelText = 'Cancel', ...prps }) => {

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth {...prps}>
            <DialogTitle className="flex justify-center p-8!">
                {Icon && <Icon className="text-5xl text-primary-main" />}
            </DialogTitle>
            <DialogContent className='px-16! py-0!'>
                {message}
            </DialogContent>
            <DialogActions className='p-8! justify-center! gap-3'>
                <Button size='md'
                    variant='success'
                    onClick={onConfirm}>
                    {confirmText}
                </Button>
                <Button size='md'
                    variant='danger'
                    onClick={onClose}>
                    {cancelText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}


export default Confirmation;