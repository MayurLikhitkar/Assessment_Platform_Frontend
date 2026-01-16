import type { FormikProps } from 'formik';
import TextArea from './TextArea';

interface FormTextAreaProps<T> {
    label: string
    name: keyof T & string,
    id: string,
    placeholder: string,
    formik: FormikProps<T>,
    rows?: number
    required?: boolean
    className?: string
    disabled?: boolean;
    withLabel?: boolean
}

const FormTextArea = <T,>({
    id,
    placeholder,
    label,
    name,
    formik,
    className,
    rows = 2,
    withLabel = true,
    required = false,
    disabled = false
}: FormTextAreaProps<T>) => {
    const error = formik.touched[name] && Boolean(formik.errors[name]);
    const helperText = formik.touched[name] && typeof formik.errors[name] === 'string'
        ? formik.errors[name] : '';

    return (
        <div className={className}>
            {withLabel && (<label className="w-full inline-block text-base font-medium text-text-main mb-2" htmlFor={id}>{label} {required ? <span className='text-error-main'>*</span> : <></>}</label>)}
            <TextArea
                id={id}
                name={name}
                placeholder={placeholder}
                required={required}
                value={formik.values[name] as string | number | readonly string[]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                rows={rows}
                className={error ? '!border-error-main !focus:ring-error-main !focus:border-error-main' : ''}
            />
            {error && (
                <div className="text-sm text-error-main mt-1">{helperText}</div>
            )}
        </div>
    )
}

export default FormTextArea;