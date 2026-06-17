import React, { type ElementType, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge';

interface PageTitleProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    icon?: ElementType;
    description?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    iconClassName?: string;
}

export const Page: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge(`min-h-screen space-y-4 pb-4`, className)} {...props}>
            {children}
        </div>
    )
}

export const PageHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge(`sticky top-0 right-0 z-999 w-full flex items-center gap-4 bg-background-light rounded-sm shadow-sm border border-border-light/30 p-4`, className)} {...props}>
            {children}
        </div>
    )
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, description, icon: Icon, titleClassName, descriptionClassName, iconClassName, ...props }) => {
    return (
        <div {...props}>
            <div className="flex items-center gap-2">
                {Icon && <Icon className={`text-3xl text-secondary-dark ${iconClassName}`} />}
                <h1 className={`text-3xl font-bold text-secondary-main ${titleClassName}`}>{title}</h1>
            </div>
            {description && <p className={`text-text-main mt-1 ${descriptionClassName}`}>{description}</p>}
        </div>
    )
}

export const PageBody: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge(`max-w-5xl mx-auto space-y-6 h-full p-4`, className)} {...props}>
            {children}
        </div>
    )
}

export const PageFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge(`max-w-5xl mx-auto sticky bottom-0 right-0 z-998 w-full flex items-center justify-end gap-4 bg-background-light rounded-xl shadow-lg border border-border-main/60 p-3 xl:p-4`, className)} {...props}>
            {children}
        </div>
    )
}

export const ContentBox: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge(`bg-background-light rounded-xl shadow-sm border border-border-light/30 p-6`, className)} {...props}>
            {children}
        </div>
    )
}