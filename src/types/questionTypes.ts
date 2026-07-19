export enum ProgrammingLanguage {
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    PYTHON = 'python',
    JAVA = 'java',
    CPP = 'cpp',
    C = 'c'
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
    _id: string;
    text: string;
    isCorrect: boolean;
}

export interface McqFields {
    options: Option[];
    isMultiSelect: boolean;
}

export interface CodingFields {
    programmingLanguages: ProgrammingLanguage[];
    starterCode?: Partial<Record<ProgrammingLanguage, string>>;
    solutionCode?: Partial<Record<ProgrammingLanguage, string>>;
    testCases: TestCase[];
    constraints?: string[];
    memoryLimitInMB?: number;
}

export interface QueryFields {
    databaseType: DatabaseType;
    databaseSchema?: string;
    sampleData?: string;
    expectedQuery: string;
    allowedKeywords?: string[];
    forbiddenKeywords?: string[];
}

export interface SubjectiveFields {
    minLength: number;
    maxLength: number;
    expectedKeywords: string[];
    sampleAnswer?: string;
}

export interface FormQuestionInterface {
    _id: string;
    type: QuestionType;
    question: string;
    questionExplanation: string;
    answerExplanation: string;
    negativeMarks: number;
    marks: number;
    difficulty: Difficulty;
    timeLimitInSeconds?: number; // in seconds
    tags: string[];
    hints?: string[];
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
    expectedKeywords?: string[];
    sampleAnswer?: string;
}

export interface QuestionInterface {
    _id: string;
    type: QuestionType;
    question: string;
    questionExplanation?: string;
    answerExplanation?: string;
    negativeMarks: number;
    marks: number;
    difficulty: Difficulty;
    timeLimitInSeconds?: number; // in seconds
    tags: string[];
    hints?: string[];
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;

    mcqFields?: McqFields;
    codingFields?: CodingFields;
    queryFields?: QueryFields;
    subjectiveFields?: SubjectiveFields;
}