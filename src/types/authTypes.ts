import type { UserInterface } from "./types";


export interface AuthState {
    user: UserInterface | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: unknown;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    updateUser: (userData: UserInterface) => void;
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

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: UserInterface;
}

export interface GetProfileResponse {
    data: UserInterface;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateUserRequest {
    fullName?: string;
    phone?: string;
    skills?: string[];
    experience?: number;
}