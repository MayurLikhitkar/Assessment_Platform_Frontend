import type { FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';
import MultiClick, { type MultiClickProps } from './MultiClick';
import Label from './Label';

interface FormMultiClickProps<FormValues, ItemType extends string | number> extends Omit<MultiClickProps<ItemType>, 'value' | 'onChange' | 'hasError'> {
    name: keyof FormValues & string;
    id?: string;
    formik: FormikProps<FormValues>;
    label?: string;
    required?: boolean;
    withLabel?: boolean;
}

const FormMultiClick = <FormValues, ItemType extends string | number>({
    name,
    id,
    formik,
    label,
    required,
    withLabel = true,
    className,
    ...props
}: FormMultiClickProps<FormValues, ItemType>) => {
    const isTouched = formik.touched[name];
    const formError = formik.errors[name];

    const errorMessage = isTouched && typeof formError === 'string' ? formError : undefined;

    const value = (formik.values[name] as unknown as ItemType[]) || [];

    const handleChange = (newValue: ItemType[]) => {
        formik.setFieldValue(name, newValue);
        formik.setFieldTouched(name, true, false);
    };

    return (
        <div className={twMerge('w-full', className)}>
            {label && withLabel && (
                <Label htmlFor={id} label={label} required={required} />
            )}
            <MultiClick<ItemType>
                id={id}
                value={value}
                onChange={handleChange}
                hasError={Boolean(errorMessage)}
                {...props}
            />
            {errorMessage && (
                <div className="text-xs text-error-main mt-1.5">{errorMessage}</div>
            )}
        </div>
    );
};

export default FormMultiClick;
