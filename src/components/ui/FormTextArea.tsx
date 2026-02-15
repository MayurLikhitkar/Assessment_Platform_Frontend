import type { FormikProps } from 'formik';
import TextArea from './TextArea';
import type { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface FormTextAreaProps<T> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    name: keyof T & string; // Strongly typed name based on Formik values
    formik: FormikProps<T>;
    id: keyof T & string; // We keep ID mandatory for accessibility (label linking)
    withLabel?: boolean;
}

const FormTextArea = <T,>({
    id,
    label,
    name,
    formik,
    withLabel = true,
    ...props
}: FormTextAreaProps<T>) => {
    const isTouched = formik.touched[name];
    const error = formik.errors[name];
    const hasError = isTouched && Boolean(error);
    const errorMessage = hasError && typeof error === 'string' ? error : '';

    const value = formik.values[name];
    const inputValue = typeof value === 'string' || typeof value === 'number' ? value : '';
    return (
        <div className={twMerge('w-full', props.className)}>
            {withLabel && (
                <label
                    htmlFor={id}
                    className="mb-2 block text-base font-medium text-text-main"
                >
                    {label}
                    {props.required && <span className="text-error-main ml-1">*</span>}
                </label>
            )}
            <TextArea
                id={id}
                name={name}
                value={inputValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={hasError ? 'ring-error-main!' : ''}
                {...props}
            />
            {hasError && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    )
}

export default FormTextArea;