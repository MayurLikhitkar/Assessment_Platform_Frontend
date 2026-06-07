export enum ProgrammingLanguage {
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    PYTHON = 'python',
    JAVA = 'java',
    CPP = 'cpp',
    CSHARP = 'csharp',
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

export interface QuestionInterface {
    _id: string;
    id: number;
    type: QuestionType;
    question: string;
    questionExplanation: string;
    answerExplanation: string;
    negativeMarks: number;
    marks: number;
    difficulty: Difficulty;
    timeLimitInSeconds?: number; // in seconds
    tags: string[];
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;

    // mcq fields
    options?: Option[];
    isMultiSelect?: boolean;

    // coding fields
    programmingLanguages?: ProgrammingLanguage[];
    starterCode?: Partial<Record<ProgrammingLanguage, string>>;
    solutionCode?: Partial<Record<ProgrammingLanguage, string>>;
    testCases?: TestCase[];
    constraints?: string[];
    hints?: string[];
    memoryLimitInMB?: number;

    // query fields
    databaseType?: DatabaseType;
    databaseSchema?: string;
    sampleData?: string;
    expectedQuery: string;
    allowedKeywords?: string[];
    forbiddenKeywords?: string[];

    // subjective fields
    minLength?: number;
    maxLength?: number;
    wordLimit?: number;
    expectedKeywords?: string[];
    sampleAnswer?: string;
}