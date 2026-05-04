import React, { type TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const TextArea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
    return (
        <textarea
            className={twMerge("p-2 w-full rounded-lg focus:outline-none focus:ring-2 ring ring-primary-dark/30 text-text-main", className)}
            {...props}
        />
    )
}

export default TextArea