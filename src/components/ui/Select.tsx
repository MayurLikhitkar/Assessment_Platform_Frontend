import React from 'react';

type Option = {
    label: string;
    value: string | number;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    value: string | number;
    options: Option[];
    placeholder: string;
}

const Select: React.FC<SelectProps> = ({
    value,
    placeholder,
    className,
    options,
    ...rest
}) => {
    return (
        <div>
            <select
                value={value}
                {...rest}
                className={`bg-background-dark p-2 rounded border border-dark-dark text-text-light py-2 w-full ${className || ''}`}
            >
                {placeholder && (
                    <option value="" className='text-text-light bg-background-main' disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} className='text-text-main bg-background-light' value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
