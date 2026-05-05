import React from 'react';
import type { FormikProps } from 'formik';
import Input from './Input';

interface FormDatePickerProps<T> extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    required?: boolean;
    dateType?: 'past' | 'future' | 'default';
    formik: FormikProps<T>;
    name: Extract<keyof T, string>;
}

const FormDatePicker = <T,>({ label, dateType = 'default', type = 'date', required, name, formik, ...props }: FormDatePickerProps<T>) => {
    const isTouched = formik.touched[name];
    const error = formik.errors[name];
    const hasError = isTouched && Boolean(error);
    const errorMessage = hasError && typeof error === 'string' ? error : '';

    const today = new Date().toISOString().split('T')[0];
    const todayDateTime = new Date().toISOString().slice(0, 16);

    let min, max;
    if (dateType === 'past') {
        max = today;
    } else if (dateType === 'future') {
        min = today;
    }

    return (
        <div className="space-y-1 w-full">
            <label htmlFor={name} className="block text-sm font-medium text-text-main">
                {label} {required && <span className="text-error-main">*</span>}
            </label>
            <Input
                id={name}
                type={type}
                name={name}
                min={min}
                max={max}
                value={formik.values[name] as string || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={hasError ? 'ring-error-main!' : ''}
                {...props}
            />
            {hasError && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    );
};

export default FormDatePicker;