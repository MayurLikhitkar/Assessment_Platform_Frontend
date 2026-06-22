import React from 'react';
import { twMerge } from 'tailwind-merge';
import type { Option } from '../../types/questionTypes';
import Input from './Input';

export interface MultiChoiceProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: Option[];
    value: string[];
    onChange: (selected: string[]) => void;
    isMultiSelect?: boolean;
    disabled?: boolean;
    hasError?: boolean;
}

const MultiChoice: React.FC<MultiChoiceProps> = ({
    options,
    value = [],
    onChange,
    isMultiSelect = false,
    disabled = false,
    hasError = false,
    className,
    id = 'mcq',
}) => {
    const handleChange = (id: string) => {
        if (disabled) return;

        if (isMultiSelect) {
            const next = value.includes(id)
                ? value.filter((i) => i !== id)
                : [...value, id];
            onChange(next);
        } else {
            onChange([id]);
        }
    };

    return (
        <div
            className={twMerge(
                'w-full flex flex-col gap-3',
                hasError && 'border-error-main bg-error-main/5 rounded-lg p-1',
                className,
            )}
        >
            {options.map(option => {
                const isSelected = value.includes(option._id);
                const inputId = `${id}-${option._id}`;

                return (
                    <label
                        key={option._id}
                        htmlFor={inputId}
                        className={twMerge(
                            // Base layout
                            'flex items-start gap-3 w-full px-4 py-3 rounded-lg border cursor-pointer text-text-light',
                            'transition-all duration-150 select-none',
                            // Default (unselected)
                            'border-border-light/80',
                            // Selected state
                            isSelected
                                ? 'bg-primary-main/5 border-primary-light/80'
                                : 'hover:bg-muted-light/60',
                            // Error state
                            hasError && !isSelected ? 'border-error-main bg-error-main/5 text-error-dark' : '',
                            // Disabled state
                            disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
                        )}
                    >
                        <Input
                            id={inputId}
                            name={id}
                            type={isMultiSelect ? 'checkbox' : 'radio'}
                            checked={isSelected}
                            onChange={() => handleChange(option._id)}
                            disabled={disabled}
                            className="shrink-0"
                        />
                        {/* Option text */}
                        <span className="text-sm leading-relaxed">
                            {option.text}
                        </span>
                    </label>
                );
            })}

            {options.length === 0 && (
                <p className="text-sm text-text-light italic py-2">No options available.</p>
            )}
        </div>
    );
};

export default MultiChoice;