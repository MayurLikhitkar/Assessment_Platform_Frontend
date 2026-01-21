import React, { type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    return (
        <input
            className={twMerge("p-2 w-full rounded-lg border border-border-main text-text-main", className)}
            {...props}
        />
    )
}

export default Input