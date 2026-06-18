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
                'w-full flex flex-col gap-2',
                hasError && 'ring-2 ring-red-400 ring-offset-2 rounded-lg p-1',
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
                            'flex items-start gap-3 w-full px-4 py-3 rounded-lg border-2 cursor-pointer',
                            'transition-all duration-150 select-none',
                            // Default (unselected)
                            'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40',
                            // Selected state
                            isSelected
                                ? 'bg-primary-main text-text-inverse'
                                : 'text-text-main',
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
                            className="sr-only"
                        />

                        <span
                            aria-hidden="true"
                            className={twMerge(
                                'mt-0.5 shrink-0 flex items-center justify-center',
                                'w-5 h-5 border-2 transition-all duration-150',
                                isMultiSelect ? 'rounded-md' : 'rounded-full',
                                isSelected
                                    ? 'border-indigo-600 bg-indigo-600'
                                    : 'border-slate-300 bg-white',
                                hasError && !isSelected && 'border-red-400',
                            )}
                        >
                            {isSelected && (
                                isMultiSelect ? (
                                    /* Checkmark */
                                    <svg
                                        className="w-3 h-3 text-white"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 6l3 3 5-5" />
                                    </svg>
                                ) : (
                                    /* Radio dot */
                                    <span className="w-2 h-2 rounded-full bg-white block" />
                                )
                            )}
                        </span>

                        {/* Option text */}
                        <span className="text-sm leading-relaxed text-slate-700">
                            {option.text}
                        </span>
                    </label>
                );
            })}

            {options.length === 0 && (
                <p className="text-sm text-slate-400 italic py-2">No options available.</p>
            )}
        </div>
    );
};

export default MultiChoice;