import React from 'react';
import {
    DatePicker as MuiDatePicker,
    type DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import {
    DateTimePicker as MuiDateTimePicker,
    type DateTimePickerProps as MuiDateTimePickerProps,
} from '@mui/x-date-pickers/DateTimePicker';

type DatePickerProps =
    | ({ withTime?: false } & Omit<MuiDatePickerProps, 'shouldDisableDate'>)
    | ({ withTime: true } & Omit<MuiDateTimePickerProps, 'shouldDisableDate'>);

const DatePicker: React.FC<DatePickerProps> = ({
    withTime = false,
    ...props
}) => {
    const commonProps: DatePickerProps = {
        className: 'w-full',
        format: withTime ? 'DD-MM-YYYY HH:mm' : 'DD-MM-YYYY',
        slotProps: {
            textField: {
                sx: {
                    borderRadius: 999,
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
            ...commonProps.slotProps,
            ...customSlotProps,
        },
    };

    if (withTime) {
        return (
            <MuiDateTimePicker
                className="w-full"
                {...(finalProps as MuiDateTimePickerProps)}
            />
        );
    }

    return (
        <MuiDatePicker
            className="w-full"
            {...(finalProps as MuiDatePickerProps)}
        />
    );
};

export default DatePicker;