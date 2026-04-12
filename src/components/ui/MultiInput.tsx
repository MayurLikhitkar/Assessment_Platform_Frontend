import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { toast } from 'react-hot-toast';
import Input from './Input';
import Button from './Button';

export interface MultiInputProps<T extends string | number> {
    name?: string;
    value: T[];
    onChange: (newValue: T[]) => void;
    placeholder?: string;
    parser?: (val: string) => T | undefined; // Optional function to parse the string input to type T
    className?: string;
    id?: string;
    hasError?: boolean;
}

const MultiInput = <T extends string | number>({
    name,
    value = [],
    onChange,
    placeholder = 'Add item and press Enter',
    parser,
    className,
    id,
    hasError,
}: MultiInputProps<T>) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddItem = (e?: React.KeyboardEvent | React.MouseEvent) => {
        // Only trigger on Enter key or Click
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e && 'preventDefault' in e) e.preventDefault();

        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        // Parse value or default to typecast
        const parsedValue = parser ? parser(trimmedInput) : (trimmedInput as unknown as T);
        if (parsedValue === undefined) return;

        if (value.includes(parsedValue)) {
            toast.error('This item already exists');
            setInputValue('');
            return;
        }

        onChange([...value, parsedValue]);
        setInputValue('');
    };

    const handleRemoveItem = (itemToRemove: T) => {
        onChange(value.filter((item) => item !== itemToRemove));
    };

    return (
        <div className={twMerge('w-full', className)}>
            <div className="flex gap-2">
                <Input
                    type="text"
                    id={id}
                    name={name}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddItem}
                    placeholder={placeholder}
                    className={hasError ? 'ring-error-main!' : ''}
                />
                <Button type="button" variant="primary" size="sm" onClick={handleAddItem} disabled={!inputValue.trim()}>
                    Add
                </Button>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {value.map((item, index) => (
                        <span
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-primary-light/20 text-text-light"
                        >
                            {String(item)}
                            <MdClose
                                className="text-xl p-0.5 ml-1 cursor-pointer rounded-full text-error-main hover:bg-error-light/50 transition-colors"
                                onClick={() => handleRemoveItem(item)}
                            />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiInput;
