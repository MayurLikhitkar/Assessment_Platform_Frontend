import React, { type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from 'react-icons/md';

type ButtonVariant = 'ghost' | 'outline' | 'solid' | 'soft' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const BackButton: React.FC<BackButtonProps> = ({
    className = '',
    onClick,
    children,
    variant = 'ghost',
    size = 'sm'
}) => {
    const navigate = useNavigate();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
        } else {
            navigate(-1);
        }
    };

    // 1. Base Styles (Layout, Animation, Focus)
    const baseStyles = "group inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 focus:outline-none disabled:opacity-50 cursor-pointer";

    // 2. Size Variants
    const sizeStyles = {
        sm: "text-sm p-1.5 gap-1.5",
        md: "text-base p-2 gap-2",
        lg: "text-lg p-3 gap-2.5",
    };

    // 3. Visual Variants (Using your App.css variables)
    const variantStyles = {
        // Subtle, blends into background. Good for headers.
        ghost: "text-text-light hover:text-primary-main hover:bg-muted-main/50 rounded-lg",

        glass:
            "bg-background-main border border-border-light shadow-sm hover:shadow-sm text-text-main hover:text-primary-main rounded-lg",

        // Has a border. Good for cards or isolated sections.
        outline: "border border-border-main text-text-main hover:border-primary-main hover:text-primary-main bg-transparent rounded-lg",

        // High emphasis. Uses your primary brand color.
        solid:
            "bg-primary-main text-text-inverse shadow-md hover:bg-primary-dark hover:shadow-lg rounded-lg",


        // Softer background. Good for modern, airy UIs.
        soft: "bg-primary-main/10 text-primary-dark hover:bg-primary-main/20 rounded-lg",
    };

    // Helper to determine icon size based on button size
    const iconSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

    return (
        <div className='flex items-center gap-2'>
            <button
                type="button"
                onClick={handleClick}
                className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            >
                <MdKeyboardBackspace
                    className={iconSize}
                />
            </button>
            {children}
        </div>
    );
};

export default BackButton;