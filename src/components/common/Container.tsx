import React, { type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const Container: React.FC<HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div className={twMerge("mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8", className)} {...props}>
            {children}
        </div>
    )
}

export default Container