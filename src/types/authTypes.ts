import type { ApiError, User } from "./types";


export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: ApiError | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    clearError: () => void;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phone?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    success: boolean;
    message: string;
}