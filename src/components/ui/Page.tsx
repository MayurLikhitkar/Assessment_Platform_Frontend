import React, { type HTMLAttributes } from 'react'

export const Page: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={`p-4 min-h-full space-y-4 relative ${className}`} {...props}>
            {children}
        </div>
    )
}

export const PageHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={`absolute top-0 right-0 w-full flex items-center gap-4 bg-background-light rounded-sm shadow-sm border border-border-light/30 p-3 ${className}`} {...props}>
            {children}
        </div>
    )
}

export const PageBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={`space-y-6 h-full ${className}`} {...props}>
            {children}
        </div>
    )
}

export const PageFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={`sticky bottom-0 right-0 w-full flex items-center justify-end gap-4 bg-background-light rounded-sm shadow-sm border border-border-light/30 p-3 ${className}`} {...props}>
            {children}
        </div>
    )
}