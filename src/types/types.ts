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