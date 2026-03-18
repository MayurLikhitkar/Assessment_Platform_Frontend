import Select from './Select';
import type { FormikProps } from 'formik';
import {
    type GroupBase, type Props as ReactSelectProps,
} from 'react-select';
import Label from './Label';

type Option = {
    label: string;
    value: string | number;
};

interface FormSelectProps<T> extends Omit<ReactSelectProps<Option, false, GroupBase<Option>>, 'value' | 'onChange'> {
    label: string
    name: keyof T & string,
    placeholder?: string,
    formik: FormikProps<T>,
    options: Option[],
    disabled?: boolean
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
    disabled = false,
    ...rest
}: FormSelectProps<T>) => {
    const error = formik.touched[name] && Boolean(formik.errors[name]);
    const helperText = formik.touched[name] && typeof formik.errors[name] === 'string'
        ? formik.errors[name] : '';

    return (
        <div className={className}>
            {withLabel && (
                <Label htmlFor={id} label={label} required={required} />
            )}
            <Select
                id={id}
                name={name}
                placeholder={placeholder}
                options={options}
                value={formik.values[name] as string | number}
                onChange={(val) => formik.setFieldValue(name, val)} // ✅ fix 2
                onBlur={() => formik.setFieldTouched(name, true)}
                isDisabled={disabled}
                classNames={{
                    control: () => error ? 'border-error-main!' : '',
                }}
                {...rest}
            />
            {error && (
                <div className="text-sm text-error-main mt-1">{helperText}</div>
            )}
        </div>
    )
}

export default FormSelect;