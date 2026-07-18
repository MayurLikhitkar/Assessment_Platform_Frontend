import { DatabaseType, ProgrammingLanguage, type TestCase } from "../../types/questionTypes";

export interface ExecuteCodePayload {
    language: ProgrammingLanguage;
    code: string;
    testCases: TestCase[];
    memoryLimitInMB?: number;
}

export enum CodeTestStatus {
    PASSED = 'passed',
    FAILED = 'failed',
    ERROR = 'error',
    MEMORY_EXCEEDED = 'memory_exceeded',
}

export interface CodeTestResult {
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    isPublic: boolean;
    status: CodeTestStatus;
    executionTimeMs?: number;
    memoryUsedMB?: number;
    error?: string;
}

export interface CodeExecutionResult {
    success: boolean;
    compileError?: string;
    runtimeError?: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    testResults: CodeTestResult[];
    executionTimeMs: number;
    memoryUsedMB: number;
}

export interface ExecuteQueryPayload {
    databaseType: DatabaseType;
    query: string;
    schema?: string;
    sampleData?: string;
    expectedQuery?: string;
    allowedKeywords?: string[];
    forbiddenKeywords?: string[];
}

export interface QueryExecutionResult {
    success: boolean;
    keywordViolations?: string[];
    matchesExpected?: boolean;
    rows?: Record<string, unknown>[];
    rowCount?: number;
    executionTimeMs?: number;
    error?: string;
}

function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getCodeSizeMB(code: string) {
    return new Blob([code]).size / (1024 * 1024);
}

export async function executeCode(
    payload: ExecuteCodePayload
): Promise<CodeExecutionResult> {
    await sleep(700);

    const { language, code, testCases, memoryLimitInMB } = payload;
    const trimmed = code.trim();

    if (!trimmed) {
        return {
            success: false,
            compileError: "No code provided.",
            totalTests: testCases.length,
            passedTests: 0,
            failedTests: testCases.length,
            testResults: [],
            executionTimeMs: 0,
            memoryUsedMB: 0,
        };
    }

    const codeSizeMB = getCodeSizeMB(code);

    if (memoryLimitInMB && codeSizeMB > memoryLimitInMB) {
        return {
            success: false,
            runtimeError: `Memory limit exceeded: ${codeSizeMB.toFixed(
                2
            )} MB used (limit ${memoryLimitInMB} MB).`,
            totalTests: testCases.length,
            passedTests: 0,
            failedTests: testCases.length,
            testResults: testCases.map((tc) => ({
                ...tc,
                status: CodeTestStatus.MEMORY_EXCEEDED,
                memoryUsedMB: codeSizeMB,
            })),
            executionTimeMs: 0,
            memoryUsedMB: codeSizeMB,
        };
    }

    // JavaScript can be executed locally for a quick preview.
    if (
        language === ProgrammingLanguage.JAVASCRIPT ||
        language === ProgrammingLanguage.TYPESCRIPT
    ) {
        const results: CodeTestResult[] = testCases.map((tc) => {
            const start = performance.now();
            try {
                const runner = new Function("input", code);
                const raw = runner(tc.input);
                const actualOutput =
                    typeof raw === "object" ? JSON.stringify(raw) : String(raw);
                const passed = actualOutput.trim() === tc.expectedOutput.trim();
                return {
                    ...tc,
                    actualOutput,
                    status: passed ? CodeTestStatus.PASSED : CodeTestStatus.FAILED,
                    executionTimeMs: Math.round(performance.now() - start),
                    memoryUsedMB: Number((codeSizeMB * 0.3).toFixed(2)),
                };
            } catch (error) {
                return {
                    ...tc,
                    status: CodeTestStatus.ERROR,
                    error: error instanceof Error ? error.message : "Runtime error",
                    executionTimeMs: Math.round(performance.now() - start),
                    memoryUsedMB: Number((codeSizeMB * 0.3).toFixed(2)),
                };
            }
        });

        const passedTests = results.filter((r) => r.status === "passed").length;
        const hasError = results.some((r) => r.status === "error");

        return {
            success: passedTests === testCases.length && !hasError,
            totalTests: testCases.length,
            passedTests,
            failedTests: testCases.length - passedTests,
            testResults: results,
            executionTimeMs: results.reduce(
                (sum, r) => sum + (r.executionTimeMs ?? 0),
                0
            ),
            memoryUsedMB: codeSizeMB,
        };
    }

    // For other languages, simulate a backend execution result.
    const hasOutputStatement =
        /return|print|console\.log|cout\s*<<|printf|System\.out|puts|echo/.test(
            trimmed
        );

    if (!hasOutputStatement) {
        return {
            success: false,
            compileError:
                "Could not compile: expected a return/output statement in the solution.",
            totalTests: testCases.length,
            passedTests: 0,
            failedTests: testCases.length,
            testResults: [],
            executionTimeMs: 0,
            memoryUsedMB: codeSizeMB,
        };
    }

    const results: CodeTestResult[] = testCases.map((tc) => ({
        ...tc,
        actualOutput: "Executed on server",
        status: CodeTestStatus.PASSED,
        executionTimeMs: Math.floor(Math.random() * 80) + 10,
        memoryUsedMB: Number((codeSizeMB * 0.5).toFixed(2)),
    }));

    return {
        success: true,
        totalTests: testCases.length,
        passedTests: testCases.length,
        failedTests: 0,
        testResults: results,
        executionTimeMs: results.reduce(
            (sum, r) => sum + (r.executionTimeMs ?? 0),
            0
        ),
        memoryUsedMB: codeSizeMB,
    };
}

export async function executeQuery(
    payload: ExecuteQueryPayload
): Promise<QueryExecutionResult> {
    await sleep(600);

    const {
        query,
        expectedQuery,
        allowedKeywords = [],
        forbiddenKeywords = [],
    } = payload;

    const normalizedQuery = query.replace(/\s+/g, " ").trim().toLowerCase();

    const violations: string[] = [];

    allowedKeywords.forEach((keyword) => {
        if (!normalizedQuery.includes(keyword.toLowerCase())) {
            violations.push(`Missing required keyword: ${keyword}`);
        }
    });

    forbiddenKeywords.forEach((keyword) => {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
            violations.push(`Forbidden keyword used: ${keyword}`);
        }
    });

    if (violations.length > 0) {
        return {
            success: false,
            keywordViolations: violations,
            matchesExpected: false,
            executionTimeMs: 0,
        };
    }

    const normalizedExpected = expectedQuery
        ? expectedQuery.replace(/\s+/g, " ").trim().toLowerCase()
        : undefined;

    const matchesExpected = normalizedExpected
        ? normalizedQuery === normalizedExpected
        : undefined;

    if (matchesExpected === false) {
        return {
            success: false,
            keywordViolations: [],
            matchesExpected: false,
            executionTimeMs: 0,
        };
    }

    return {
        success: true,
        keywordViolations: [],
        matchesExpected: matchesExpected ?? true,
        rowCount: 3,
        rows: [
            { id: 1, name: "Alice", active: 1 },
            { id: 2, name: "Bob", active: 1 },
            { id: 3, name: "Carol", active: 0 },
        ],
        executionTimeMs: 45,
    };
}