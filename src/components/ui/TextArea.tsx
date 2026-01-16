import React, { type TextareaHTMLAttributes } from 'react'

const TextArea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, rows, required = false, ...props }) => {
    return (
        <div>
            <textarea
                className={`bg-background-dark p-2 w-full rounded border border-dark-dark text-text-light ${className || ''}`}
                rows={rows}
                {...props}
            />
        </div>
    )
}

export default TextArea