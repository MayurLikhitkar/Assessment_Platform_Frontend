import React from 'react';
import Button from './Button';

interface TabButtonProps {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
    return (
        <Button variant='underline'
            className={isActive
                ? 'text-primary-main'
                : 'text-text-light hover:text-text-dark'
            }
            onClick={onClick}
        >
            {icon}
            {label}
        </Button>
    );
};

export default TabButton;
