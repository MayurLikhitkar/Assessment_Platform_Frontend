// User Types
export interface User {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin' | 'evaluator' | 'super_admin';
    status: 'active' | 'inactive' | 'suspended';
    profilePicture?: string;
    phone?: string;
    skills: string[];
    experience?: number;
    requireWebcam: boolean;
    requireMicrophone: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
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
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}