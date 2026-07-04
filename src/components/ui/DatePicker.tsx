import React from 'react';
import {
    DatePicker as MuiDatePicker,
    type DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import {
    DateTimePicker as MuiDateTimePicker,
    type DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';

type BaseProps = {
    withTime?: boolean;
    hasError?: boolean;
};

export type DatePickerProps = BaseProps &
    Partial<MuiDatePickerProps> &
    Partial<MuiDateTimePickerProps>;

const DatePicker: React.FC<DatePickerProps> = ({
    withTime = false,
    hasError = false,
    ...props
}) => {
    const { slotProps: customSlotProps, ...restProps } = props;

    const datePickerProps: DatePickerProps = {
        className: 'w-full',
        format: withTime ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY',
        ...restProps,
        slotProps: {
            ...customSlotProps,
            textField: {
                fullWidth: true,
                size: 'small',
                className: [
                    '[&_.MuiPickersOutlinedInput-root]:rounded-lg!',
                    '[&_.MuiPickersOutlinedInput-notchedOutline]:border!',
                    !hasError && '[&_.MuiPickersOutlinedInput-notchedOutline]:border-primary-light/50!',
                    !hasError && '[&_.MuiPickersOutlinedInput-root.Mui-focused_.MuiPickersOutlinedInput-notchedOutline]:border-primary-light!',
                    !hasError && '[&_.MuiPickersOutlinedInput-root:hover_.MuiPickersOutlinedInput-notchedOutline]:border-primary-light!',
                    hasError && '[&_.MuiPickersOutlinedInput-notchedOutline]:border-error-main!',
                    hasError && '[&_.MuiPickersOutlinedInput-root.Mui-focused_.MuiPickersOutlinedInput-notchedOutline]:border-error-main!',
                    hasError && '[&_.MuiPickersOutlinedInput-root:hover_.MuiPickersOutlinedInput-notchedOutline]:border-error-main!',

                    '[&_.MuiPickersInputBase-sectionsContainer]:py-2.5!',
                ].filter(Boolean).join(' ')
            },
            openPickerButton: {
                sx: {
                    color: 'var(--color-primary-main)',
                },
            },
            day: {
                className: '!rounded-lg',
                sx: {
                    '&.Mui-selected': {
                        backgroundColor: 'var(--color-primary-dark)',
                    },
                    '&:hover': {
                        backgroundColor: 'var(--color-primary-main)',
                    },
                },
            },
        }
    };
    if (withTime) {
        return (
            <MuiDateTimePicker
                {...(datePickerProps as MuiDateTimePickerProps)}
            />
        );
    }

    return (
        <MuiDatePicker
            {...(datePickerProps as MuiDatePickerProps)}
        />
    );
};

export default DatePicker;