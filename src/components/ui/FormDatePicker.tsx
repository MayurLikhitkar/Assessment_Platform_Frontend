import type { FormikProps } from 'formik';
import moment, { type Moment } from 'moment';
import { twMerge } from 'tailwind-merge';
import DatePicker, { type DatePickerProps } from './DatePicker';
import Label from './Label';

interface FormDatePickerProps<T> extends Omit<DatePickerProps, 'onChange' | 'value'> {
    label: string;
    withLabel?: boolean;
    withTime?: boolean;
    formik: FormikProps<T>;
    name: keyof T & string;
    id?: keyof T & string;
    required?: boolean;
}

const errorStyles = [
    '[&_.MuiOutlinedInput-notchedOutline]:!border-error-main',
    '[&_.MuiFormHelperText-root]:!text-error-main',
].join(' ');

const FormDatePicker = <T,>({
    label,
    name,
    formik,
    id,
    withLabel = true,
    withTime,
    required,
    ...props
}: FormDatePickerProps<T>) => {
    const isTouched = formik.touched[name];
    const error = formik.errors[name];
    const hasError = Boolean(isTouched) && Boolean(error);
    const errorMessage = hasError && typeof error === 'string' ? error : '';

    const value = formik.values[name]
        ? moment(formik.values[name])
        : null;

    const handleChange = (newValue: Moment | null) => {
        formik.setFieldValue(name, newValue ? newValue.toDate() : null);
    };

    const mergedClassName = twMerge(
        'w-full',
        hasError && errorStyles,
    );

    return (
        <div className="w-full">
            {withLabel && label && (
                <Label htmlFor={id} label={label} required={required} />
            )}
            <DatePicker
                value={value}
                onChange={handleChange}
                withTime={withTime}
                className={mergedClassName}
                slotProps={{
                    textField: {
                        error: hasError,
                        helperText: errorMessage,
                        onBlur: () => formik.setFieldTouched(name, true, true),
                        id: id,
                        name: name,
                    },
                }}
                {...props}
            />
        </div>
    );
};

export default FormDatePicker;
