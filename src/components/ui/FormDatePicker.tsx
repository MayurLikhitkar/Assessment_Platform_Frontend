import type { FormikProps } from 'formik';
import moment, { type Moment } from 'moment';
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
    const formError = formik.errors[name];
    const errorMessage = isTouched && typeof formError === 'string' ? formError : undefined;

    const value = formik.values[name]
        ? moment(formik.values[name])
        : null;

    const handleChange = (newValue: Moment | null) => {
        formik.setFieldValue(name, newValue ? newValue.toDate() : null);
        formik.setFieldTouched(name, true, false);
    };

    return (
        <div className="w-full">
            {withLabel && label && (
                <Label htmlFor={id} label={label} required={required} />
            )}
            <DatePicker
                value={value}
                onChange={handleChange}
                withTime={withTime}
                hasError={Boolean(errorMessage)}
                {...props}
            />
            {errorMessage && (
                <div className="text-sm text-error-main mt-1">{errorMessage}</div>
            )}
        </div>
    );
};

export default FormDatePicker;
