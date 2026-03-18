import ReactSelect, {
    type ClassNamesConfig, type GroupBase, type Props as ReactSelectProps,
} from 'react-select';
import { twMerge } from 'tailwind-merge';

type Option = {
    label: string;
    value: string | number;
};

interface SelectProps extends Omit<ReactSelectProps<Option, false, GroupBase<Option>>, 'value' | 'onChange'> {
    value: string | number;
    options: Option[];
    placeholder?: string;
    onChange?: (value: string | number) => void;
}

const baseClassNames: ClassNamesConfig<Option, false, GroupBase<Option>> = {
    control: ({ isFocused }) =>
        twMerge(
            'rounded-lg bg-background-light px-1 min-h-[40px]! cursor-pointer transition-all ring ring-primary-dark/40',
            isFocused && 'ring-2 focus:outline-none'
        ),
    valueContainer: () => 'px-2 py-0.5 text-text-main',
    singleValue: () => 'text-text-main text-sm',
    placeholder: () => 'text-text-light text-sm',
    input: () => 'text-text-main',
    menu: () => 'rounded-lg border border-primary-light/30 bg-background-light shadow-xl overflow-hidden',
    menuList: () => 'p-1.5 flex flex-col gap-1',
    option: ({ isSelected, isFocused }) =>
        twMerge(
            'rounded-md text-md! px-3 py-1 cursor-pointer transition-colors text-center',
            isSelected
                ? 'bg-primary-main text-text-inverse font-medium'
                : isFocused
                    ? 'bg-secondary-main text-text-inverse'
                    : 'text-text-main'
        ),
    dropdownIndicator: ({ isFocused, selectProps }) =>
        twMerge(
            'px-2 transition-all duration-200',
            isFocused ? 'text-primary-main' : 'text-text-light hover:text-primary-main',
            selectProps.menuIsOpen ? 'rotate-180' : 'rotate-0'
        ),
    clearIndicator: () => 'px-1 text-text-light hover:text-error-main transition-colors',
    indicatorSeparator: () => 'hidden',
    noOptionsMessage: () => 'text-text-light text-sm py-2',
    // menuPortal: () => 'z-[999]',
};

const Select: React.FC<SelectProps> = ({ value, id, placeholder, className, options, onChange, classNames: extraClassNames, ...rest }) => {
    return (
        <ReactSelect
            inputId={id}
            unstyled
            value={options.find((opt) => opt.value === value) ?? null}
            options={options}   
            placeholder={placeholder}
            classNames={{
                ...baseClassNames,
                control: (state) => twMerge(baseClassNames.control?.(state), extraClassNames?.control?.(state)),
            }}
            styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            menuPosition='fixed'
            onChange={(opt) => onChange?.(opt?.value ?? '')}
            className={className}
            {...rest}
        />
    )
};

export default Select;