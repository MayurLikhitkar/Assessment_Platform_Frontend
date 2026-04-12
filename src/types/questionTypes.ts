export enum ProgrammingLanguage {
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    PYTHON = 'python',
    JAVA = 'java',
    CPP = 'c++',
    CSHARP = 'c#',
    R = 'r',
    SQL = 'sql',
    HTML = 'html',
    CSS = 'css'
}
export enum QuestionType {
    MCQ = 'mcq',
    CODING = 'coding',
    QUERY = 'query',
    SUBJECTIVE = 'subjective',
}

export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum DatabaseType {
    MYSQL = 'mysql',
    POSTGRESQL = 'postgresql',
    MONGODB = 'mongodb',
    SQLITE = 'sqlite',
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    isPublic: boolean;
}

export interface Option {
    text: string;
    isCorrect: boolean;
}

export interface EvaluationRubric {
    criteria: string;
    maxScore: number;
    description?: string;
}

export interface QuestionInterface {
    _id: string;
    id: number;
    type: QuestionType;
    question: string;
    questionExplanation: string;
    marks: number;
    difficulty: Difficulty;
    tags: string[];
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;

    // Type-specific fields (using discriminators or union types)
    options?: Option[];
    negativeMarks: number;
    answerExplanation: string;

    language?: ProgrammingLanguage;
    allowedLanguages?: ProgrammingLanguage[];
    starterCode?: Map<ProgrammingLanguage, string>;
    testCases?: TestCase[];
    constraints?: string[];
    hints?: string[];
    timeLimitInMinutes: number; // in minutes
    memoryLimitInMB: number; // in MB

    databaseType?: DatabaseType;
    databaseSchema?: string;
    sampleData?: string;
    expectedQuery?: string;

    maxLength?: number;
    minLength?: number;
    expectedKeywords?: string[];
    evaluationRubric?: EvaluationRubric[];
    subjectiveAnswer?: string;
}

export interface TestCaseFormValue {
    input: string;
    expectedOutput: string;
    isPublic: boolean;
    points: number;
}

export interface RubricFormValue {
    criteria: string;
    maxScore: number;
    description: string;
}

export interface StarterCodeEntry {
    language: ProgrammingLanguage;
    code: string;
}