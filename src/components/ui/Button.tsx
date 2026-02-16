import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'underline' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    loadingText?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'sm',
    loading = false,
    loadingText,
    disabled,
    ...props
}) => {
    const baseStyles = 'flex gap-2 items-center justify-center font-medium rounded-md cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group';

    const variants = {
        primary: 'bg-primary-main hover:bg-primary-dark text-text-inverse focus:ring-primary-light',
        secondary: 'bg-secondary-dark hover:bg-secondary-main text-text-inverse focus:ring-secondary-light',
        outline: 'border border-primary-main/50 hover:bg-background-dark text-text-main focus:ring-primary-light',
        underline: 'px-4 py-2 border-b-2 border-primary-main hover:bg-background-main text-text-main',
        success: 'bg-success-dark hover:bg-success-main text-text-inverse focus:ring-success-light',
        danger: 'bg-error-dark hover:bg-error-main text-text-inverse focus:ring-error-light',
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