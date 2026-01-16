import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    disabled,
    ...props
}) => {
    const baseStyles = 'font-medium rounded-md cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-main hover:bg-primary-dark text-text-inverse focus:ring-primary-light',
        secondary: 'bg-secondary-main hover:bg-secondary-dark text-text-inverse focus:ring-secondary-light',
        outline: 'border border-border-main hover:bg-background-dark text-text-main focus:ring-primary-light',
        danger: 'bg-error-main hover:bg-error-dark text-text-inverse focus:ring-error-light',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const spinnerColor = variant === 'outline'
        ? 'border-text-main border-t-transparent'
        : 'border-text-inverse border-t-transparent';

    return (
        <button
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className={`animate-spin rounded-full h-4 w-4 border-3 mr-2 ${spinnerColor}`}></div>
                    {loadingText || 'Loading...'}
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;