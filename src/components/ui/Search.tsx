import React, { type InputHTMLAttributes } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import Input from './Input';
import Button from './Button';

type SearchProps = InputHTMLAttributes<HTMLInputElement> & {
    handleClear?: () => void;
    containerClassName?: string;
};

const Search: React.FC<SearchProps> = ({ value, handleClear, className, containerClassName, ...props }) => {
    return (
        <div className={twMerge('relative flex items-center', containerClassName)}>
            <MdSearch className="absolute left-3 text-text-light text-xl pointer-events-none" />
            <Input
                value={value}
                placeholder="Search"
                className={twMerge(
                    'px-10 py-2 border-border-light/70 rounded-lg!',
                    className
                )}
                {...props}
            />
            {value && handleClear && (
                <Button
                    type="button"
                    onClick={handleClear}
                    variant='outline'
                    aria-label="Clear search"
                    className="absolute right-2 p-0.5 text-primary-light"
                >
                    <MdClose className="text-lg" />
                </Button>
            )}
        </div>
    );
};

export default Search;