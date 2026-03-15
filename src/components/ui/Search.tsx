import React, { type InputHTMLAttributes } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';

type SearchProps = InputHTMLAttributes<HTMLInputElement> & {
    handleClear?: () => void;
    containerClassName?: string;
};

const Search: React.FC<SearchProps> = ({ value, handleClear, className, containerClassName, ...props }) => {
    return (
        <div className={twMerge('relative flex items-center', containerClassName)}>
            <MdSearch className="absolute left-3 text-text-light text-xl pointer-events-none" />
            <input
                type="text"
                value={value}
                placeholder="Search"
                className={twMerge(
                    'w-full pl-9 pr-8 py-2 rounded-lg text-sm text-text-main bg-background-light',
                    'border border-border-light/50 focus:outline-none focus:ring-2 focus:ring-primary-light/50',
                    'placeholder:text-text-light transition-all duration-200',
                    className
                )}
                {...props}
            />
            {value && handleClear && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute right-2 p-0.5 text-text-main hover:text-text-light rounded transition-colors"
                >
                    <MdClose className="text-lg" />
                </button>
            )}
        </div>
    );
};

export default Search;