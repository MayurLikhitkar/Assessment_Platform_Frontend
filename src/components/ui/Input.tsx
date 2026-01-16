import React, { type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    return (
        <input
            className={twMerge("bg-background-dark p-2 w-full rounded border border-dark-dark text-text-light", className)}
            {...props}
        />
    )
}

export default Input