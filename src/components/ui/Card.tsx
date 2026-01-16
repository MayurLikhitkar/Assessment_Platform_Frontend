import React from 'react';
import { twMerge } from 'tailwind-merge';

// Card Components
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge('bg-background-main rounded-xl shadow-sm border border-border-main', className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge('px-6 py-4 border-b border-border-main', className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardTitle: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge('text-lg font-semibold text-text-main', className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={twMerge('p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
};