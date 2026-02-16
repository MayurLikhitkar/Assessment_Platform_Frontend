import type { InputHTMLAttributes } from 'react';
import Input from './Input';
import type { FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';
import Label from './Label';

interface FormInputProps<T> extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: keyof T & string; // Strongly typed name based on Formik values
    formik: FormikProps<T>;
    id: keyof T & string; // We keep ID mandatory for accessibility (label linking)
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
                <Label htmlFor={id} label={label} required={props.required} />
            )}
            <Input
                id={id}
                name={name}
                autoComplete='postal-code new-password name given-name family-name username mobile tel email webauthn country'
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

export default FormInput;