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

export interface AssessmentInterface {
    _id: string;
    id: number;
    title: string;
    description: string;
    type: AssessmentType[];
    difficulty: AssessmentDifficulty;
    durationInMinutes: number;
    totalMarks: number;
    passingMarks: number;
    questions: string[];
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
    isPublic: boolean;
    startDate?: Date;
    endDate?: Date;
    tags: string[];
    instructions: string;

    // Proctoring settings
    requireWebcam: boolean;
    requireMicrophone: boolean;
    allowTabSwitch: boolean;
    maxTabSwitches: number;
    allowFullscreenExit: boolean;
    maxFullscreenExits: number;
    enableRecording: boolean;

    createdAt: Date;
    updatedAt: Date;
}