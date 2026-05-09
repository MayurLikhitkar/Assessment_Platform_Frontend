import type { FormikProps } from 'formik';
import { type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import moment, { type Moment } from 'moment';
import { twMerge } from 'tailwind-merge';

import DatePicker from './DatePicker';

interface FormDatePickerProps<T> extends Omit<DateTimePickerProps<Moment>, 'onChange' | 'value'> {
    label: string;
    required?: boolean;
    dateType?: 'past' | 'future' | 'default';
    withTime?: boolean;
    formik: FormikProps<T>;
    name: Extract<keyof T, string>;
    id?: string;
    className?: string;
}

const errorStyles = [
    '[&_.MuiOutlinedInput-notchedOutline]:!border-error-main',
    '[&_.MuiFormHelperText-root]:!text-error-main',
].join(' ');

const FormDatePicker = <T,>({
    label,
    dateType = 'default',
    required,
    name,
    formik,
    className = '',
    id,
    withTime,
    ...props
}: FormDatePickerProps<T>) => {
    const isTouched = formik.touched[name];
    const error = formik.errors[name];
    const hasError = Boolean(isTouched) && Boolean(error);
    const errorMessage = hasError && typeof error === 'string' ? error : '';

    const value = formik.values[name]
        ? moment(formik.values[name] as string | Date)
        : null;

    let minDate: Moment | undefined;
    let maxDate: Moment | undefined;
    if (dateType === 'past') maxDate = moment();
    else if (dateType === 'future') minDate = moment();

    const handleChange = (newValue: Moment | null) => {
        formik.setFieldValue(name, newValue ? newValue.toDate() : null);
    };

    const mergedClassName = twMerge(
        'w-full',
        hasError && errorStyles,
        className,
    );

    return (
        <div className="w-full">
            <DatePicker
                label={required ? `${label} *` : label}
                value={value}
                onChange={handleChange}
                minDate={minDate}
                maxDate={maxDate}
                withTime={withTime as false}
                type={dateType}
                className={mergedClassName}
                slotProps={{
                    textField: {
                        error: hasError,
                        helperText: errorMessage,
                        onBlur: () => formik.setFieldTouched(name, true, true),
                        fullWidth: true,
                        id: id || name,
                        size: 'small',
                    },
                }}
                {...props}
            />
        </div>
    );
};

export default FormDatePicker;
