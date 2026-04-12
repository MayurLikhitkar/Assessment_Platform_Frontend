import type { FormikProps } from 'formik';
import { twMerge } from 'tailwind-merge';
import MultiInput, { type MultiInputProps } from './MultiInput';
import Label from './Label';

interface FormMultiInputProps<FormValues, ItemType extends string | number> extends Omit<MultiInputProps<ItemType>, 'value' | 'onChange' | 'hasError'> {
    name: keyof FormValues & string;
    id: keyof FormValues & string;
    formik: FormikProps<FormValues>;
    label?: string;
    required?: boolean;
    withLabel?: boolean;
}

const FormMultiInput = <FormValues, ItemType extends string | number>({
    name,
    id,
    formik,
    label,
    required,
    withLabel = true,
    ...props
}: FormMultiInputProps<FormValues, ItemType>) => {
    const isTouched = formik.touched[name];
    const formError = formik.errors[name];

    // Generally the form validaton for arrays returns a string directly when it's an array structural issue 
    // e.g. "Needs at least 1 tag"
    const errorMessage = isTouched && typeof formError === 'string' ? formError : undefined;

    const value = (formik.values[name] as unknown as ItemType[]) || [];

    const handleChange = (newValue: ItemType[]) => {
        formik.setFieldValue(name, newValue);
        // We set touched but avoid rapid validation trigger loops
        formik.setFieldTouched(name, true, false);
    };

    return (
        <div className={twMerge('w-full', props.className)}>
            {withLabel && label && (
                <Label htmlFor={id} label={label} required={required} />
            )}
            <MultiInput<ItemType>
                id={id}
                name={name}
                value={value}
                onChange={handleChange}
                hasError={Boolean(errorMessage)}
                {...props}
            />
            {errorMessage && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    );
};

export default FormMultiInput;
