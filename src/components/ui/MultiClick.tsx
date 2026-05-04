import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface MultiClickProps<T extends string | number> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: { label: string; value: T }[] | string[];
    value: T[];
    onChange: (value: T[]) => void;
    hasError?: boolean;
}

const MultiClick = <T extends string | number>({
    options,
    value,
    onChange,
    hasError,
    className,
    ...props
}: MultiClickProps<T>) => {
    const handleToggle = (optValue: T) => {
        if (value.includes(optValue)) {
            onChange(value.filter(v => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    return (
        <div className={twMerge('flex flex-wrap gap-2', className)} {...props}>
            {options.map((option) => {
                const optValue = (typeof option === 'string' ? option : option.value) as T;
                // Give objects their specific label, or format the raw string nicely
                const optLabel = typeof option === 'string' ? option.toUpperCase() : option.label;
                const isSelected = value.includes(optValue);

                return (
                    <button
                        key={String(optValue)}
                        type="button"
                        onClick={() => handleToggle(optValue)}
                        className={twMerge(
                            'px-3 py-2 text-xs font-medium rounded-lg cursor-pointer border transition-colors border-primary-dark/40',
                            isSelected
                                ? 'bg-primary-main/10 text-primary-main'
                                : 'text-text-main',
                            hasError && !isSelected ? 'border-error-main bg-error-main/5 text-error-main' : ''
                        )}
                    >
                        {optLabel}
                    </button>
                );
            })}
        </div>
    );
};

export default MultiClick;
