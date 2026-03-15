export enum UserRole {
    USER = 'user',
    EVALUATOR = 'evaluator',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
    PROCTOR = 'proctor', // important for live proctoring
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
}

export interface UserInterface {
    _id: string;
    id: number;
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    profilePicture?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    dateOfBirth?: Date;
    skills: string[];
    experience?: number;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    lastLogin?: Date;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    requireWebcam: boolean;
    requireMicrophone: boolean;
}

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