// User Assessment Types (join between a user and an AssessmentInterface)
export type UserAssessmentStatus = 'assigned' | 'in-progress' | 'completed' | 'expired';

export interface UserAssessmentInterface {
    userAssessmentId: number;
    assessmentId: number;
    status: UserAssessmentStatus;
    isPassed?: boolean;
    score?: number;
    totalMarks?: number;
    completedAt?: string;
    timeSpent?: number;
    assessment?: import('./assessmentTypes').AssessmentInterface;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    responseMessage: string;
    errorMessage?: string;
    error?: unknown;
    data: T;
}
export interface ApiError {
    success: boolean;
    responseMessage: string;
    errorMessage?: string;
    error?: unknown;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}