import React, { type TextareaHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const TextArea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
    return (
        <textarea
            className={twMerge("p-2 w-full outline-none rounded-lg border-2 border-primary-light/50 hover:border-primary-light focus:border-primary-light text-text-main", className)}
            {...props}
        />
    )
}

export default TextArea