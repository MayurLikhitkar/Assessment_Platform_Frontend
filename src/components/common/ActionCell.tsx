import React from 'react';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';

export interface Action {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    className?: string;
}

export interface ActionCellProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    viewTitle?: string;
    editTitle?: string;
    deleteTitle?: string;
    customActions?: Action[];
}

const ActionCell: React.FC<ActionCellProps> = ({
    onView,
    onEdit,
    onDelete,
    viewTitle = "View Details",
    editTitle = "Edit",
    deleteTitle = "Delete",
    customActions = []
}) => {
    return (
        <div className="flex items-center gap-2">
            {onView && (
                <button
                    onClick={onView}
                    className="p-1.5 rounded-lg hover:bg-secondary-light/20 text-secondary-main transition-colors"
                    title={viewTitle}
                >
                    <MdVisibility className="text-lg" />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="p-1.5 rounded-lg hover:bg-primary-light/10 text-primary-main transition-colors"
                    title={editTitle}
                >
                    <MdEdit className="text-lg" />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg hover:bg-error-light/20 text-error-main transition-colors"
                    title={deleteTitle}
                >
                    <MdDelete className="text-lg" />
                </button>
            )}
            {customActions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.onClick}
                    className={`p-1.5 rounded-lg transition-colors ${action.className || 'hover:bg-muted-light/20 text-text-light'}`}
                    title={action.title}
                >
                    {action.icon}
                </button>
            ))}
        </div>
    );
};

export default ActionCell;
