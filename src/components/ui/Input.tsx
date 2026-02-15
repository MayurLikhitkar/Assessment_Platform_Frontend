import React, { type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    return (
        <input
            className={twMerge("p-2 w-full rounded-lg focus:outline-none focus:ring-2 ring ring-primary-light/60 text-text-main", className)}
            {...props}
        />
    )
}

export default Input