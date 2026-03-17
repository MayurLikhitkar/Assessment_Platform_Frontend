import React, { type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const baseStyles = "focus:outline-none focus:ring-2 ring-primary-dark/40 text-text-main transition-all duration-200"

const stylesByType: Record<string, string> = {
    default: "p-2 w-full rounded-lg ring ring-primary-dark/40",
    checkbox: "w-5 h-5 rounded accent-primary-dark cursor-pointer",
    radio: "w-5 h-5 accent-primary-dark cursor-pointer",
    range: "w-full h-2 rounded-lg accent-primary-dark cursor-pointer appearance-none bg-primary-dark/20",
    color: "w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden",
    file: "w-full p-2 rounded-lg ring ring-primary-dark/40 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-dark/10 file:text-text-main hover:file:bg-primary-dark/20 file:cursor-pointer cursor-pointer",
}

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({
    className,
    type = 'text',
    ...props
}) => {
    const typeStyles = stylesByType[type] ?? stylesByType.default

    return (
        <input
            type={type}
            className={twMerge(baseStyles, typeStyles, className)}
            {...props}
        />
    )
}

export default Input