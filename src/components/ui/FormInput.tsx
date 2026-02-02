import type { InputHTMLAttributes } from 'react';
import Input from './Input';
import type { FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';

interface FormInputProps<T> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'value' | 'onChange' | 'onBlur'> {
    label: string;
    name: keyof T & string; // Strongly typed name based on Formik values
    formik: FormikProps<T>;
    id: string; // We keep ID mandatory for accessibility (label linking)
    withLabel?: boolean;
}

const FormInput = <T,>({
    id,
    label,
    name,
    formik,
    withLabel = true,
    ...props
}: FormInputProps<T>) => {

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
            <Input
                id={id}
                name={name}
                {...props}
                autoComplete='postal-code new-password name given-name family-name username mobile tel email webauthn country'
                value={inputValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={hasError ? 'border-error-main! !focus:ring-error-main !focus:border-error-main' : ''}
            />
            {hasError && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    )
}

export default FormInput;