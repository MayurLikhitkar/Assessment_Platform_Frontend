import type { FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';
import MultiChoice, { type MultiChoiceProps } from './MultiChoice';
import Label from './Label';

export interface FormMultiChoiceProps<FormValues> extends Omit<MultiChoiceProps, 'value' | 'onChange' | 'hasError'> {
    name: keyof FormValues & string;
    id: keyof FormValues & string;
    formik: FormikProps<FormValues>;
    label?: string;
    required?: boolean;
    withLabel?: boolean;
}

const FormMultiChoice = <FormValues,>({
    name,
    id,
    formik,
    label,
    required,
    withLabel = true,
    className,
    ...props
}: FormMultiChoiceProps<FormValues>) => {
    const isTouched = formik.touched[name];
    const formError = formik.errors[name];

    const errorMessage = isTouched && typeof formError === 'string' ? formError : undefined;

    const value = (formik.values[name] as string[]) || []

    const handleChange = (next: string[]) => {
        formik.setFieldValue(name, next);
        formik.setFieldTouched(name, true, false);
    };

    return (
        <div className={twMerge('w-full', className)}>
            {withLabel && label && (
                <Label htmlFor={id} label={label} required={required} />
            )}

            <MultiChoice
                id={id}
                value={value}
                onChange={handleChange}
                hasError={Boolean(errorMessage)}
                {...props}
            />

            {errorMessage && (
                <p className="text-sm text-error-main mt-1">{errorMessage}</p>
            )}
        </div>
    );
};

export default FormMultiChoice;