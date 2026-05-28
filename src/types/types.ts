// User Assessment Types (join between a user and an AssessmentInterface)
export type UserAssessmentStatus = 'assigned' | 'in-progress' | 'completed' | 'expired';

export interface UserAssessmentInterface {
    _id: string;
    id: number;
    userId: string;
    assessmentId: number;
    status: UserAssessmentStatus;
    startedAt?: Date;
    completedAt?: Date;
    timeSpent: number;
    score?: number;
    totalMarks: number;
    answers: any[];

    // Proctoring data
    recordingUrl?: string;
    tabSwitches: number;
    fullscreenExits: number;
    violations: {
        type: 'tab_switch' | 'fullscreen_exit' | 'no_webcam' | 'multiple_faces' | 'no_audio';
        timestamp: Date;
        details?: string;
    }[];

    evaluatedBy?: string;
    evaluationDate?: Date;
    feedback?: string;
    isPassed: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
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