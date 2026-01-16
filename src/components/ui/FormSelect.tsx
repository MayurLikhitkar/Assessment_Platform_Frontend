import Select from './Select';
import type { FormikProps } from 'formik';

interface FormSelectProps<T> {
    label: string
    name: keyof T & string,
    id: string,
    placeholder: string,
    formik: FormikProps<T>,
    options: { label: string, value: string | number }[],
    required?: boolean
    disabled?: boolean
    className?: string;
    withLabel?: boolean;
}

const FormSelect = <T,>({
    id,
    placeholder,
    label,
    name,
    className,
    options,
    formik,
    withLabel = true,
    required = false,
    disabled = false
}: FormSelectProps<T>) => {
    const error = formik.touched[name] && Boolean(formik.errors[name]);
    const helperText = formik.touched[name] && typeof formik.errors[name] === 'string'
        ? formik.errors[name] : '';

    return (
        <div className={className}>
            {withLabel && (<label className="w-full inline-block text-base font-medium text-text-main mb-2" htmlFor={id}>{label} {required ? <span className='text-error-main'>*</span> : <></>}</label>)}
            <Select
                id={id}
                name={name}
                placeholder={placeholder}
                options={options}
                required={required}
                value={formik.values[name] as string | number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                className={error ? '!border-error-main !focus:ring-error-main !focus:border-error-main' : ''}
            />
            {error && (
                <div className="text-sm text-error-main mt-1">{helperText}</div>
            )}
        </div>
    )
}

export default FormSelect;