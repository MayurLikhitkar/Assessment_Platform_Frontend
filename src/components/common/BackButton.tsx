import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

interface BackButtonProps {
    className?: string;
    onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '', onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`p-2 hover:bg-muted-light rounded-full text-text-light hover:text-text-dark transition-colors shrink-0 ${className}`}
            aria-label="Go back"
        >
            <MdArrowBack className="text-xl" />
        </button>
    );
};

export default BackButton;
