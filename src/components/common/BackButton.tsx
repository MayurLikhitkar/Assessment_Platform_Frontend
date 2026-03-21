import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from 'react-icons/md';

type ButtonVariant = 'ghost' | 'outline' | 'solid' | 'soft';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BackButtonProps {
    className?: string;
    onClick?: () => void;
    label?: string; // Optional text label (e.g., "Go Back")
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const BackButton: React.FC<BackButtonProps> = ({
    className = '',
    onClick,
    label,
    variant = 'ghost',
    size = 'md'
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    // 1. Base Styles (Layout, Animation, Focus)
    const baseStyles = "group inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-light disabled:opacity-50 cursor-pointer";

    // 2. Size Variants
    const sizeStyles = {
        sm: "text-sm p-1.5 gap-1.5",
        md: "text-base p-2 gap-2",
        lg: "text-lg p-3 gap-2.5",
    };

    // 3. Visual Variants (Using your App.css variables)
    const variantStyles = {
        // Subtle, blends into background. Good for headers.
        ghost: "text-text-main hover:text-primary-main hover:bg-muted-main/50 rounded-full",

        // Has a border. Good for cards or isolated sections.
        outline: "border border-border-main text-text-main hover:border-primary-main hover:text-primary-main bg-transparent rounded-lg",

        // High emphasis. Uses your primary brand color.
        solid: "bg-primary-main text-text-inverse hover:bg-primary-dark shadow-sm hover:shadow-md rounded-lg",

        // Softer background. Good for modern, airy UIs.
        soft: "bg-background-dark text-text-main hover:bg-primary-light/20 hover:text-primary-dark rounded-lg",
    };

    // Helper to determine icon size based on button size
    const iconSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            aria-label={label || "Go back"}
        >
            {/* The Arrow Icon with a slide animation on hover */}
            <MdKeyboardBackspace
                className={`${iconSize} transition-transform duration-200 group-hover:scale-120`}
            />

            {/* Conditional Label Rendering */}
            {label && <span>{label}</span>}
        </button>
    );
};

export default BackButton;