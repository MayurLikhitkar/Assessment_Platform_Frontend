import React from 'react';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
    position?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top' }) => {

    // Positioning classes (Tailwind-based)
    const positions: Record<string, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        topLeft: 'bottom-full left-0 mb-2',
        topRight: 'bottom-full right-0 mb-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        bottomLeft: 'top-full left-0 mt-2',
        bottomRight: 'top-full right-0 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    };

    const normalizedPosition =
        position.replace('-', '').replace('left', 'Left').replace('right', 'Right');

    return (
        <div className="relative cursor-pointer group">
            {children}

            <div
                role="tooltip"
                className={`
                    absolute z-10 px-3 py-1 font-semibold text-xs
                    text-text-inverse bg-secondary-main rounded-sm whitespace-normal
                    transition-all duration-200 pointer-events-none
                    opacity-0 scale-95
                    group-hover:opacity-100 group-hover:scale-100
                    group-focus-within:opacity-100 group-focus-within:scale-100
                    ${positions[normalizedPosition] ?? positions['top']}
                `}
            >
                {text}
            </div>
        </div>
    );
}

export default Tooltip;