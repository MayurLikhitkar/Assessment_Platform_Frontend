import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'underline' | 'success' | 'icon' | 'text' | 'custom' | 'glass';
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
    type = 'button',
    ...props
}) => {
    const baseStyles = 'flex gap-2 items-center justify-center font-medium rounded-md cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group';

    const variants = {
        primary: 'bg-primary-main hover:bg-primary-dark text-text-inverse focus:border-primary-light',
        secondary: 'bg-secondary-main hover:bg-secondary-dark text-text-inverse focus:border-secondary-light',
        accent: 'bg-accent-main hover:bg-accent-dark text-text-inverse focus:border-accent-light',
        outline: 'border border-primary-main/40 hover:bg-primary-light/10 text-text-main focus:border-primary-light',
        underline: 'px-4 py-2 border-b-2 border-primary-main hover:bg-background-main text-text-main',
        success: 'bg-success-dark hover:bg-success-main text-text-inverse focus:border-success-light',
        danger: 'bg-error-dark hover:bg-error-main text-text-inverse focus:border-error-light',
        icon: 'bg-background-light text-text-light hover:text-error-main hover:bg-error-light/10 focus:border-error-light',
        text: 'text-text-main hover:text-primary-main px-0!',
        glass: 'bg-background-main border border-border-light shadow-sm hover:shadow-lg text-text-main',
        custom: '',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    // For icon variant, we might not want padding padding if size isn't specified, but we'll apply it base on size.
    if (variant === 'icon') {
        sizes.sm = 'p-1.5 text-sm rounded-full';
        sizes.md = 'p-2 text-base rounded-full';
        sizes.lg = 'p-3 text-lg rounded-full';
    }

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
            type={type}
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