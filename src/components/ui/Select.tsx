import { type SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type Option = {
    label: string;
    value: string | number;
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
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
        <select
            value={value}
            {...rest}
            className={twMerge("p-2 w-full rounded-lg focus:outline-none focus:ring-2 ring ring-primary-light/60 text-text-main", className)}
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
    );
};

export default Select;
