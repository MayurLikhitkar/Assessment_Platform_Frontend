export enum AssessmentStatus {
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
    TERMINATED = 'terminated',
}

export enum VoilationType {
    TAB_SWITCH = 'tab_switch',
    FULLSCREEN_EXIT = 'fullscreen_exit',
    NO_WEBCAM = 'no_webcam',
    MULTIPLE_FACES = 'multiple_faces',
    NO_AUDIO = 'no_audio',
}


export interface UserAssessmentInterface {
    _id: string;
    id: number;
    userId: string;
    assessmentId: string;
    status: AssessmentStatus;
    startedAt?: Date;
    completedAt?: Date;
    timeSpentInSeconds: number;
    score: number;
    totalMarks: number;
    answers: any[];

    // Proctoring data
    recordingUrl?: string;
    tabSwitches: number;
    fullscreenExits: number;
    violations: {
        type: VoilationType;
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