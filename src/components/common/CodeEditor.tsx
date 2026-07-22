import { useState } from "react";
import Editor from "@monaco-editor/react";
import { twMerge } from "tailwind-merge";
import {
    FaCheck,
    FaClock,
    FaCode,
    FaDatabase,
    FaExclamationTriangle,
    FaMemory,
    FaPlay,
    FaTimes,
} from "react-icons/fa";
import {
    DatabaseType,
    ProgrammingLanguage,
    QuestionType,
    type QuestionInterface,
} from "../../types/questionTypes";
import {
    executeCode,
    executeQuery,
    type CodeExecutionResult,
    type QueryExecutionResult,
} from "../../services/axios/executionApi";
import Select from "../ui/Select";
import { capitalizeFirstLetter } from "../../utils/utils";
import Button from "../ui/Button";

const languageMap: Record<ProgrammingLanguage, string> = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
};

const dbLanguageMap: Record<DatabaseType, string> = {
    mysql: "sql",
    postgresql: "sql",
    sqlite: "sql",
    mongodb: "javascript",
};

const defaultStarters: Record<ProgrammingLanguage, string> = {
    javascript:
        '// input: two numbers separated by a space, e.g. "2 3"\nconst [a, b] = input.split(" ").map(Number);\n// TODO: return the sum\nreturn a + b;',
    typescript:
        '// input: two numbers separated by a space, e.g. "2 3"\nconst [a, b] = (input as string).split(" ").map(Number);\n// TODO: return the sum\nreturn a + b;',
    python:
        'def solution(input):\n    a, b = map(int, input.split())\n    # TODO: return the result\n    return a + b',
    java:
        'public class Solution {\n    public static int solution(String input) {\n        String[] parts = input.split(" ");\n        int a = Integer.parseInt(parts[0]);\n        int b = Integer.parseInt(parts[1]);\n        // TODO: return the result\n        return a + b;\n    }\n}',
    cpp:
        '#include <bits/stdc++.h>\nusing namespace std;\n\nint solution(string input) {\n    stringstream ss(input);\n    int a, b;\n    ss >> a >> b;\n    // TODO: return the result\n    return a + b;\n}',
    c:
        '#include <stdio.h>\n\nint solution(char* input) {\n    int a, b;\n    sscanf(input, "%d %d", &a, &b);\n    // TODO: return the result\n    return a + b;\n}',
};

type CodeEditorProps =
    | {
        type: QuestionType.CODING;
        question: QuestionInterface;
        value?: Partial<Record<ProgrammingLanguage, string>>;
        onChange: (value: Partial<Record<ProgrammingLanguage, string>>) => void;
    }
    | {
        type: QuestionType.QUERY;
        question: QuestionInterface;
        value?: string;
        onChange: (value: string) => void;
    };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        passed: "bg-success-light/20 text-success-dark border-success-light",
        failed: "bg-error-light/20 text-error-dark border-error-light",
        error: "bg-error-light/20 text-error-dark border-error-light",
        memory_exceeded: "bg-warn-light/20 text-warn-dark border-warn-light",
    };

    return (
        <span
            className={twMerge(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                styles[status] ?? "bg-muted-light text-text-light border-border-light"
            )}
        >
            {status === "passed" ? (
                <FaCheck className="w-3 h-3" />
            ) : status === "failed" || status === "error" ? (
                <FaTimes className="w-3 h-3" />
            ) : (
                <FaExclamationTriangle className="w-3 h-3" />
            )}
            {status.replace("_", " ")}
        </span>
    );
}

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
    const { question } = props;
    const [hasUserChanged, setHasUserChanged] = useState(false);

    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<
        CodeExecutionResult | QueryExecutionResult | null
    >(null);

    // --- CODING-only state
    const codingFields = question.codingFields;
    const languages = codingFields?.programmingLanguages ?? [];
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | undefined>(
        languages[0]
    );
    const activeLanguage: ProgrammingLanguage | undefined =
        selectedLanguage && languages.includes(selectedLanguage)
            ? selectedLanguage
            : languages[0];
    const [codeMap, setCodeMap] = useState<Partial<Record<ProgrammingLanguage, string>>>(() => {
        const map: Partial<Record<ProgrammingLanguage, string>> = {};
        languages.forEach((lang) => {
            map[lang] = props.type === QuestionType.CODING
                ? props.value?.[lang]
                : undefined;
        });
        return map;
    });

    // --- QUERY-only state
    const queryFields = question.queryFields;
    const [query, setQuery] = useState(
        props.type === QuestionType.QUERY ? props.value ?? "" : ""
    );

    const currentCode = activeLanguage ? (codeMap[activeLanguage] ?? "") : "";

    const getStarterCode = (lang: ProgrammingLanguage) => {
        return codingFields?.starterCode?.[lang] ?? defaultStarters[lang] ?? "";
    };

    const displayCode = activeLanguage && !codeMap[activeLanguage]
        ? getStarterCode(activeLanguage)
        : currentCode;

    const handleCodeChange = (next: string) => {
        if (!activeLanguage) return;

        const isFirstChange = !hasUserChanged &&
            (props.type === QuestionType.CODING ?
                !props.value?.[activeLanguage] : true);

        setCodeMap((prev) => {
            const updated = { ...prev, [activeLanguage]: next };
            if (props.type === QuestionType.CODING) {
                props.onChange(updated);
                if (isFirstChange) setHasUserChanged(true);
            }
            return updated;
        });
    };

    const handleQueryChange = (next: string) => {
        const isFirstChange = !hasUserChanged && !props.value;

        setQuery(next);
        if (props.type === QuestionType.QUERY) {
            props.onChange(next);
            if (isFirstChange) setHasUserChanged(true);
        }
    };

    const handleRun = async () => {
        if (!activeLanguage || !codingFields) return;
        setRunning(true);
        setResult(null);
        const code = codeMap[activeLanguage] ?? "";
        const res = await executeCode({
            language: activeLanguage,
            code,
            testCases: codingFields!.testCases,
            memoryLimitInMB: codingFields!.memoryLimitInMB,
        });
        setResult(res);
        setRunning(false);
    };

    const handleValidate = async () => {
        if (!queryFields) return;
        setRunning(true);
        setResult(null);
        const res = await executeQuery({
            databaseType: queryFields.databaseType,
            query,
            schema: queryFields.databaseSchema,
            sampleData: queryFields.sampleData,
            expectedQuery: queryFields.expectedQuery,
            allowedKeywords: queryFields.allowedKeywords,
            forbiddenKeywords: queryFields.forbiddenKeywords,
        });
        setResult(res);
        setRunning(false);
    };

    if (props.type === QuestionType.CODING) {
        const monacoLanguage = activeLanguage ? languageMap[activeLanguage] : "plaintext";
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FaCode className="text-secondary-main" />
                        <label htmlFor="language-select" className="font-medium">
                            Language
                        </label>
                    </div>
                    <Select
                        name="language"
                        value={activeLanguage}
                        onChange={(value) =>
                            setSelectedLanguage(value as ProgrammingLanguage)
                        }
                        options={languages.map((lang) => ({
                            value: lang,
                            label: capitalizeFirstLetter(lang),
                        }))}
                    />

                    {codingFields?.memoryLimitInMB && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-light">
                            <FaMemory />
                            Memory limit: {codingFields.memoryLimitInMB} MB
                        </span>
                    )}

                    <Button
                        onClick={handleRun}
                        variant="secondary"
                        disabled={running || !activeLanguage}
                        className="ml-auto"
                    >
                        {running ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background-light/30 border-t-background-light" />
                        ) : (
                            <FaPlay className="w-3.5 h-3.5" />
                        )}
                        {running ? "Running…" : "Run Test Cases"}
                    </Button>
                </div>

                <div className="h-80 rounded-xl border border-border-light overflow-hidden">
                    <Editor
                        height="100%"
                        language={monacoLanguage}
                        defaultValue={`// Start coding from here!`}
                        value={displayCode}
                        onChange={(value) => handleCodeChange(value ?? "")}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            automaticLayout: true,
                            padding: { top: 16 },
                        }}
                    />
                </div>

                {result && "testResults" in result && (
                    <CodeOutputPanel result={result} />
                )}
            </div>
        );
    }

    const monacoLanguage = queryFields?.databaseType
        ? dbLanguageMap[queryFields.databaseType]
        : "sql";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <FaDatabase className="text-secondary-main" />
                    <span className="font-medium">Database :</span>
                    <span className="uppercase tracking-wide text-sm">
                        {queryFields?.databaseType}
                    </span>
                </div>

                <Button
                    onClick={handleValidate}
                    disabled={running || !queryFields}
                    variant="secondary"
                    className="ml-auto"
                >
                    {running ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-background-light/30 border-t-background-light" />
                    ) : (
                        <FaPlay className="w-3.5 h-3.5" />
                    )}
                    {running ? "Validating…" : "Validate Query"}
                </Button>
            </div>

            <div className="h-80 rounded-xl border border-border-light overflow-hidden">
                <Editor
                    height="100%"
                    language={monacoLanguage}
                    value={query}
                    onChange={(value) => handleQueryChange(value ?? "")}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        automaticLayout: true,
                        padding: { top: 16 },
                    }}
                />
            </div>

            {result && !("testResults" in result) && (
                <QueryOutputPanel result={result} />
            )}
        </div>
    );
}

const CodeOutputPanel: React.FC<{ result: CodeExecutionResult }> = ({ result }) => {
    const allPassed = result.passedTests === result.totalTests && result.success;

    return (
        <div className="rounded-xl border border-border-light bg-background-light overflow-hidden">
            <div className="border-b border-border-light bg-background-main px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-text-dark">Test Results</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span
                            className={twMerge(
                                "font-medium",
                                allPassed ? "text-success-dark" : "text-warn-dark"
                            )}
                        >
                            {result.passedTests}/{result.totalTests} passed
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-text-light">
                            <FaClock className="w-3.5 h-3.5" />
                            {result.executionTimeMs} ms
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-text-light">
                            <FaMemory className="w-3.5 h-3.5" />
                            {result.memoryUsedMB.toFixed(2)} MB
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {result.compileError && (
                    <div className="rounded-lg bg-error-light/20 border border-error-light p-3 text-sm text-error-dark">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        {result.compileError}
                    </div>
                )}
                {result.runtimeError && (
                    <div className="rounded-lg bg-error-light/20 border border-error-light p-3 text-sm text-error-dark">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        {result.runtimeError}
                    </div>
                )}

                <div className="space-y-3">
                    {result.testResults.map((tc, idx) => (
                        <div
                            key={idx}
                            className={twMerge(
                                "rounded-lg border p-3 text-sm",
                                tc.status === "passed"
                                    ? "bg-success-light/10 border-success-light"
                                    : tc.status === "memory_exceeded"
                                        ? "bg-warn-light/10 border-warn-light"
                                        : "bg-error-light/10 border-error-light"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-text-main">
                                    Test {idx + 1}
                                    {!tc.isPublic && (
                                        <span className="ml-2 text-xs text-text-light">(hidden)</span>
                                    )}
                                </span>
                                <StatusBadge status={tc.status} />
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-text-light">Input</span>
                                    <pre className="mt-1 rounded border border-border-light bg-background-light p-2 font-mono text-text-main">
                                        {tc.input}
                                    </pre>
                                </div>
                                <div>
                                    <span className="text-text-light">Expected Output</span>
                                    <pre className="mt-1 rounded border border-border-light bg-background-light p-2 font-mono text-text-main">
                                        {tc.expectedOutput}
                                    </pre>
                                </div>
                                {tc.actualOutput !== undefined && (
                                    <div className="md:col-span-2">
                                        <span className="text-text-light">Actual Output</span>
                                        <pre className="mt-1 rounded border border-border-light bg-background-light p-2 font-mono text-text-main">
                                            {tc.actualOutput}
                                        </pre>
                                    </div>
                                )}
                                {tc.error && (
                                    <div className="md:col-span-2 text-error-main">{tc.error}</div>
                                )}
                                {tc.executionTimeMs !== undefined && (
                                    <div className="md:col-span-2 text-text-light">
                                        {tc.executionTimeMs} ms
                                        {tc.memoryUsedMB !== undefined &&
                                            ` · ${tc.memoryUsedMB.toFixed(2)} MB`}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const QueryOutputPanel: React.FC<{ result: QueryExecutionResult }> = ({ result }) => {
    return (
        <div className="rounded-xl border border-border-light bg-background-light overflow-hidden">
            <div className="border-b border-border-light bg-background-main px-4 py-3">
                <h4 className="font-semibold text-text-dark">Query Validation</h4>
            </div>

            <div className="p-4 space-y-4">
                {result.keywordViolations && result.keywordViolations.length > 0 && (
                    <div className="rounded-lg bg-warn-light/20 border border-warn-light p-3 text-sm text-warn-dark">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        Keyword issues detected:
                        <ul className="list-disc ml-5 mt-1 space-y-0.5">
                            {result.keywordViolations.map((v, i) => (
                                <li key={i}>{v}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.error && (
                    <div className="rounded-lg bg-error-light/20 border border-error-light p-3 text-sm text-error-dark">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        {result.error}
                    </div>
                )}

                {result.matchesExpected !== undefined && (
                    <div
                        className={twMerge(
                            "inline-flex items-center gap-2 text-sm font-medium",
                            result.matchesExpected ? "text-success-dark" : "text-warn-dark"
                        )}
                    >
                        {result.matchesExpected ? (
                            <>
                                <FaCheck className="w-4 h-4" /> Matches expected query
                            </>
                        ) : (
                            <>
                                <FaTimes className="w-4 h-4" /> Does not match expected query
                            </>
                        )}
                    </div>
                )}

                {result.rows && result.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-border-light">
                        <table className="min-w-full text-xs">
                            <thead className="bg-background-main">
                                <tr>
                                    {Object.keys(result.rows[0]).map((key) => (
                                        <th
                                            key={key}
                                            className="border-b border-border-light px-3 py-2 text-left font-semibold text-text-light"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.rows.map((row, idx) => (
                                    <tr key={idx} className="even:bg-background-main/50">
                                        {Object.values(row).map((value, vidx) => (
                                            <td
                                                key={vidx}
                                                className="border-b border-border-light px-3 py-2 text-text-main"
                                            >
                                                {String(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {result.executionTimeMs !== undefined && (
                    <div className="text-xs text-text-light">
                        Execution time: {result.executionTimeMs} ms
                        {result.rowCount !== undefined && ` · ${result.rowCount} rows`}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CodeEditor;