export enum UserRole {
    USER = 'user',
    EVALUATOR = 'evaluator',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
    PROCTOR = 'proctor',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export interface PersonalInfo {
    dateOfBirth?: Date;
    profilePicture?: string;
    nickName?: string;
    gender?: Gender;
}

export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
}

export interface WorkExperience {
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
}

export interface Qualification {
    skills: string[];
    languages: string[];
    education: Education[];
    workExperience: WorkExperience[];
    totalExperience: number;
}

export interface Location {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
}

export interface SocialProfile {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
    website?: string;
}

export interface UserInterface {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    password: string;
    role: UserRole;
    status: UserStatus;

    personalInfo: PersonalInfo;
    qualification: Qualification;
    location: Location;
    socialProfile: SocialProfile;

    lastLogin?: Date;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;

    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
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