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
};

export type DatePickerProps = BaseProps &
    Partial<MuiDatePickerProps> &
    Partial<MuiDateTimePickerProps>;

const DatePicker: React.FC<DatePickerProps> = ({
    withTime = false,
    ...props
}) => {
    const commonProps: DatePickerProps = {
        className: 'w-full',
        format: withTime ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY',
        slotProps: {
            textField: {
                fullWidth: true,
                size: 'small',
                className: [
                    '[&_.MuiPickersOutlinedInput-root]:!rounded-lg',
                    '[&_.MuiPickersOutlinedInput-notchedOutline]:!border-2',
                    '[&_.MuiPickersOutlinedInput-notchedOutline]:!border-primary-light/50',
                    '[&_.MuiPickersOutlinedInput-root.Mui-focused_.MuiPickersOutlinedInput-notchedOutline]:!border-primary-light',
                    '[&_.MuiPickersOutlinedInput-root:hover_.MuiPickersOutlinedInput-notchedOutline]:!border-primary-light',
                ].join(' '),
                sx: {
                    // '& .MuiPickersOutlinedInput-root': {
                    //     borderRadius: '28px',
                    // },
                    // '& .MuiPickersOutlinedInput-notchedOutline': {
                    //     borderColor: 'red',
                    // },
                    '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-primary-light)',  // ✅ hover
                    },
                },

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

    const { slotProps: customSlotProps, ...restProps } = props;

    const finalProps = {
        ...commonProps,
        ...restProps,
        slotProps: {
            ...customSlotProps,
            ...commonProps.slotProps,
        },
    };

    if (withTime) {
        return (
            <MuiDateTimePicker
                {...(finalProps as MuiDateTimePickerProps)}
            />
        );
    }

    return (
        <MuiDatePicker
            {...(finalProps as MuiDatePickerProps)}
        />
    );
};

export default DatePicker;