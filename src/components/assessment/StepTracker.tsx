import React from "react";
import { RiCheckLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

type StepId = 'overview' | 'permissions' | 'checklist' | 'ready';

interface Step {
    id: StepId;
    label: string;
}

export const STEPS: Step[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'ready', label: 'Ready' },
];

const StepTracker: React.FC<{ currentIndex: number }> = ({ currentIndex }) => (
    <div className="flex items-center mb-8">
        {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5">
                    <div className={twMerge(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
                        i < currentIndex && 'bg-success-main text-text-inverse',
                        i === currentIndex && 'bg-background-main border-2 border-border-dark text-text-main',
                        i > currentIndex && 'bg-muted-light border border-border-light text-text-light',
                    )}>
                        {i < currentIndex ? <RiCheckLine className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={twMerge(
                        'text-[10px] whitespace-nowrap',
                        i === currentIndex ? 'text-text-main font-semibold' : 'text-text-light',
                    )}>
                        {step.label}
                    </span>
                </div>
                {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border-light mx-1 mb-5" />
                )}
            </React.Fragment>
        ))}
    </div>
);

export default StepTracker;