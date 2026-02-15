// User Types
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
    id: number;
    fullName: string;
    email: string;
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
    lastLogin?: Date;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    requireWebcam: boolean;
    requireMicrophone: boolean;
}

// Category Types
export interface AssessmentCategory {
    categoryId: number;
    name: string;
    description?: string;
    type: ('aptitude' | 'coding' | 'query' | 'subjective')[];
    subCategories: string[];
    icon?: string;
    colorCode?: string;
    isActive: boolean;
    createdBy: number;
}

// Question Types
export type ProgrammingLanguage =
    | 'javascript' | 'typescript' | 'python' | 'java'
    | 'c++' | 'c#' | 'php' | 'ruby' | 'go' | 'rust'
    | 'swift' | 'kotlin' | 'dart' | 'scala' | 'r'
    | 'sql' | 'html' | 'css' | 'bash' | 'powershell';

export interface Question {
    questionId: number;
    type: 'mcq' | 'coding' | 'query' | 'subjective';
    question: string;
    marks: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categoryId: number;
    tags: string[];

    // MCQ specific
    options?: {
        id: number;
        text: string;
        isCorrect: boolean;
    }[];
    allowMultiple?: boolean;
    negativeMarks?: number;
    explanation?: string;

    // Coding specific
    language?: ProgrammingLanguage;
    allowedLanguages?: ProgrammingLanguage[];
    starterCode?: { [key in ProgrammingLanguage]?: string };
    testCases?: {
        testCaseId: number;
        input: string;
        expectedOutput: string;
        isPublic: boolean;
        points: number;
    }[];
    constraints?: string;
    hints?: string[];
    timeLimit?: number;
    memoryLimit?: number;

    // Query specific
    databaseType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite';
    databaseSchema?: string;
    tables?: any[];
    expectedQuery?: string;
    expectedOutput?: any[];

    // Subjective specific
    maxLength?: number;
    minLength?: number;
    expectedKeywords?: string[];
    evaluationRubric?: {
        criteria: string;
        maxScore: number;
        description: string;
    }[];
}

// Assessment Types
export interface Assessment {
    assessmentId: number;
    title: string;
    description: string;
    categoryId: number;
    type: ('aptitude' | 'coding' | 'query' | 'subjective')[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    duration: number;
    totalMarks: number;
    passingMarks: number;
    questions: any[];
    isActive: boolean;
    isPublic: boolean;
    startDate?: string;
    endDate?: string;
    tags: string[];
    instructions: string;
    requireWebcam: boolean;
    requireMicrophone: boolean;
    allowTabSwitch: boolean;
    maxTabSwitches: number;
    allowFullscreenExit: boolean;
    maxFullscreenExits: number;
    enableRecording: boolean;
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