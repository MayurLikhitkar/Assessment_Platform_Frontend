import React from 'react';
import type { FormikProps } from 'formik';

interface FormDatePickerProps<T> extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    required?: boolean;
    type?: 'past' | 'future' | 'default';
    formik: FormikProps<T>;
    name: Extract<keyof T, string>;
}

const FormDatePicker = <T,>({ label, type = 'default', required, name, formik, className = '', ...props }: FormDatePickerProps<T>) => {
    const isTouched = formik.touched[name];
    const error = formik.errors[name];
    const hasError = isTouched && Boolean(error);
    const errorMessage = hasError && typeof error === 'string' ? error : '';

    const today = new Date().toISOString().split('T')[0];

    let min, max;
    if (type === 'past') {
        max = today;
    } else if (type === 'future') {
        min = today;
    }

    return (
        <div className="space-y-1 w-full">
            <label htmlFor={name} className="block text-sm font-medium text-text-main">
                {label} {required && <span className="text-error-main">*</span>}
            </label>
            <input
                id={name}
                type="date"
                name={name}
                min={min}
                max={max}
                value={formik.values[name] as string || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 border rounded-lg bg-background-main text-text-main focus:outline-none focus:ring-2 transition-all
                    ${hasError
                        ? 'border-error-main focus:ring-error-light/30 focus:border-error-main'
                        : 'border-border-light focus:ring-primary-light/30 focus:border-primary-light'
                    } ${className}`}
                {...props}
            />
            {hasError && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    );
};

export default FormDatePicker;