import { ContentBox } from "../ui/Page";
import { RiArrowRightLine, RiCheckLine, RiInformationLine } from "react-icons/ri";
import Button from "../ui/Button";
import { twMerge } from "tailwind-merge";

export type CheckKey = 'connection' | 'environment' | 'rules';
export type ChecklistKey = 'connection' | 'environment' | 'rules';

interface ChecklistItem {
    key: ChecklistKey;
    label: string;
}

interface CheckItemProps {
    item: ChecklistItem;
    checked: boolean;
    onToggle: (key: ChecklistKey) => void;
}

interface ChecklistPanelProps {
    checks: Record<CheckKey, boolean>;
    onToggle: (key: CheckKey) => void;
    onNext: () => void;
}

const CheckItem: React.FC<CheckItemProps> = ({ item, checked, onToggle }) => (
    <button
        onClick={() => onToggle(item.key)}
        className="flex items-center gap-3 text-sm text-left text-text-main w-full group"
    >
        <span
            className={twMerge(
                'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-150',
                checked
                    ? 'bg-success-main border-success-main text-text-inverse'
                    : 'border-border-main bg-background-light group-hover:border-border-dark'
            )}
        >
            {checked && <RiCheckLine className="w-3 h-3" />}
        </span>
        <span className={checked ? 'line-through text-text-light' : ''}>{item.label}</span>
    </button>
);

const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ checks, onToggle, onNext }) => {
    const allChecked = Object.values(checks).every(Boolean);


    const CHECKLIST_ITEMS: ChecklistItem[] = [
        { key: 'connection', label: 'I have a stable internet connection' },
        { key: 'environment', label: 'I am in a quiet environment without distractions' },
        { key: 'rules', label: 'I have read and understood all the rules above' },
    ];

    return (
        <>
            <ContentBox className="space-y-4">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-light">
                    Before you begin
                </h2>
                <div className="space-y-2">
                    {CHECKLIST_ITEMS.map(item => (
                        <button
                            key={item.key}
                            onClick={() => onToggle(item.key)}
                            className="flex items-center gap-3 w-full text-left group py-1"
                        >
                            <span className={twMerge(
                                'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-150',
                                checks[item.key]
                                    ? 'bg-success-main border-success-main text-text-inverse'
                                    : 'border-border-main bg-background-light group-hover:border-border-dark',
                            )}>
                                {checks[item.key] && <RiCheckLine className="w-3 h-3" />}
                            </span>
                            <span className={twMerge(
                                'text-sm text-text-main',
                                checks[item.key] && 'line-through text-text-light',
                            )}>
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>

                {!allChecked && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warn-light/10 border border-warn-light text-warn-dark text-xs">
                        <RiInformationLine className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Please confirm all three items above before continuing.</span>
                    </div>
                )}
            </ContentBox>

            <Button
                variant={allChecked ? 'primary' : 'custom'}
                disabled={!allChecked}
                onClick={onNext}
                className={twMerge(
                    'w-full justify-center py-3 gap-2 rounded-xl text-sm',
                    !allChecked && 'opacity-40 cursor-not-allowed bg-muted-main border border-border-main',
                )}
            >
                Everything looks good <RiArrowRightLine className="w-4 h-4" />
            </Button>
        </>
    );
};

export default ChecklistPanel;