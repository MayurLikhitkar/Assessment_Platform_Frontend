export enum AssessmentType {
    APTITUDE = 'aptitude',
    CODING = 'coding',
    QUERY = 'query',
    SUBJECTIVE = 'subjective',
    MCQ = 'mcq',
}

export enum AssessmentDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
}

export interface ILimit {
    allowed: boolean
    max?: number
}

export interface IRecord {
    allowed: boolean
    url?: string
}

export interface AssessmentInterface {
    title: string;
    description: string;
    type: AssessmentType[];
    difficulty: AssessmentDifficulty;
    durationInMinutes: number;
    totalMarks: number;
    passingMarks: number;
    questions: string[];
    startDate?: Date;
    endDate?: Date;
    tags: string[];
    instructions: string;
    isActive: boolean;
    isPublic: boolean;
    negativeMarking: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Proctoring settings
    webcam: IRecord;
    microphone: IRecord;
    enableRecording: boolean;
    tabSwitch: ILimit;
    fullscreenExit: ILimit;

    createdBy: string;
    updatedBy: string;
}

export interface FormAssessmentInterface {
    title: string;
    description: string;
    type: AssessmentType[];
    difficulty: AssessmentDifficulty;
    durationInMinutes: number;
    totalMarks: number;
    passingMarks: number;
    questions: string[];
    isActive: boolean;
    isPublic: boolean;
    startDate?: Date;
    endDate?: Date;
    tags: string[];
    instructions: string;
    negativeMarking: boolean;

    // Proctoring settings
    requireWebcam: boolean;
    requireMicrophone: boolean;
    allowTabSwitch: boolean;
    maxTabSwitches?: number;
    allowFullscreenExit: boolean;
    maxFullscreenExits?: number;
    enableRecording: boolean;

    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type AssessmentSortableFields = Pick<AssessmentInterface, 'createdAt' | 'title' | 'difficulty' | 'durationInMinutes' | 'startDate' | 'endDate'>;

export interface GetAssessmentsParams {
    search?: string;
    type?: AssessmentType;
    difficulty?: AssessmentDifficulty;
    isActive?: boolean;
    isPublic?: boolean;
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    sortBy?: keyof AssessmentSortableFields;
    sortOrder?: 'asc' | 'desc';
}