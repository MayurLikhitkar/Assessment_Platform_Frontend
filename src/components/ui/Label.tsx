import React, { type LabelHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

interface LableProps extends LabelHTMLAttributes<HTMLLabelElement> {
    label: string;
    required?: boolean;
}


const Label: React.FC<LableProps> = ({ className, label, required = false, ...props }) => {
    return (
        <label
            className={twMerge("w-full mb-2 block text-base font-medium text-text-main", className)}
            {...props}
        >
            {label}
            {required && <span className="text-error-main ml-1">*</span>}
        </label>
    )
}

export default Label