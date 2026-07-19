import { useEffect, useState } from "react";
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

type SimpleCodeEditorProps =
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
    
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        passed: "bg-emerald-100 text-emerald-700 border-emerald-200",
        failed: "bg-rose-100 text-rose-700 border-rose-200",
        error: "bg-rose-100 text-rose-700 border-rose-200",
        memory_exceeded: "bg-amber-100 text-amber-700 border-amber-200",
    };

    return (
        <span
            className={twMerge(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
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

export default function SimpleCodeEditor(props: SimpleCodeEditorProps) {
    const { type, question } = props;

    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<
        CodeExecutionResult | QueryExecutionResult | null
    >(null);

    if (type === QuestionType.CODING) {
        const codingFields = question.codingFields!;
        const languages = codingFields.programmingLanguages;
        const onChange = props.onChange;

        const [activeLanguage, setActiveLanguage] = useState(languages[0]);
        const [codeMap, setCodeMap] = useState<
            Partial<Record<ProgrammingLanguage, string>>
        >(() => {
            const map: Partial<Record<ProgrammingLanguage, string>> = {};
            languages.forEach((lang) => {
                map[lang] =
                    props.value?.[lang] ??
                    codingFields.starterCode?.[lang] ??
                    defaultStarters[lang] ??
                    "";
            });
            return map;
        });

        useEffect(() => {
            if (!languages.includes(activeLanguage)) {
                setActiveLanguage(languages[0]);
            }
        }, [languages, activeLanguage]);

        const currentCode = codeMap[activeLanguage] ?? "";

        useEffect(() => {
            onChange(codeMap);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const handleCodeChange = (next: string) => {
            setCodeMap((prev) => {
                const updated = { ...prev, [activeLanguage]: next };
                onChange(updated);
                return updated;
            });
        };

        const handleRun = async () => {
            setRunning(true);
            setResult(null);
            const code = codeMap[activeLanguage] ?? "";
            const res = await executeCode({
                language: activeLanguage,
                code,
                testCases: codingFields.testCases,
                memoryLimitInMB: codingFields.memoryLimitInMB,
            });
            setResult(res);
            setRunning(false);
        };

        const monacoLanguage = languageMap[activeLanguage] ?? "plaintext";

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FaCode className="text-indigo-600" />
                        <label htmlFor="language-select" className="font-medium">
                            Language
                        </label>
                    </div>
                    <select
                        id="language-select"
                        value={activeLanguage}
                        onChange={(e) =>
                            setActiveLanguage(e.target.value as ProgrammingLanguage)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>

                    {codingFields.memoryLimitInMB && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <FaMemory />
                            Memory limit: {codingFields.memoryLimitInMB} MB
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleRun}
                        disabled={running}
                        className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {running ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <FaPlay className="w-3.5 h-3.5" />
                        )}
                        {running ? "Running…" : "Run Test Cases"}
                    </button>
                </div>

                <div className="h-80 rounded-xl border border-slate-200 overflow-hidden">
                    <Editor
                        height="100%"
                        language={monacoLanguage}
                        value={currentCode}
                        onChange={(value) => handleCodeChange(value ?? "")}
                        theme="vs-light"
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

    const queryFields = question.queryFields!;
    const onChange = props.onChange;
    const [query, setQuery] = useState(props.value ?? "");

    useEffect(() => {
        onChange(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQueryChange = (next: string) => {
        setQuery(next);
        onChange(next);
    };

    const handleValidate = async () => {
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

    const monacoLanguage = dbLanguageMap[queryFields.databaseType] ?? "sql";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    <FaDatabase className="text-indigo-600" />
                    <span className="font-medium">Database</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide">
                        {queryFields.databaseType}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleValidate}
                    disabled={running}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                    {running ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                        <FaPlay className="w-3.5 h-3.5" />
                    )}
                    {running ? "Validating…" : "Validate Query"}
                </button>
            </div>

            <div className="h-80 rounded-xl border border-slate-200 overflow-hidden">
                <Editor
                    height="100%"
                    language={monacoLanguage}
                    value={query}
                    onChange={(value) => handleQueryChange(value ?? "")}
                    theme="vs-light"
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

function CodeOutputPanel({ result }: { result: CodeExecutionResult }) {
    const allPassed = result.passedTests === result.totalTests && result.success;

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-900">Test Results</h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span
                            className={twMerge(
                                "font-medium",
                                allPassed ? "text-emerald-700" : "text-amber-700"
                            )}
                        >
                            {result.passedTests}/{result.totalTests} passed
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <FaClock className="w-3.5 h-3.5" />
                            {result.executionTimeMs} ms
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                            <FaMemory className="w-3.5 h-3.5" />
                            {result.memoryUsedMB.toFixed(2)} MB
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {result.compileError && (
                    <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        {result.compileError}
                    </div>
                )}
                {result.runtimeError && (
                    <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700">
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
                                    ? "bg-emerald-50/50 border-emerald-100"
                                    : tc.status === "memory_exceeded"
                                        ? "bg-amber-50/50 border-amber-100"
                                        : "bg-rose-50/50 border-rose-100"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-slate-700">
                                    Test {idx + 1}
                                    {!tc.isPublic && (
                                        <span className="ml-2 text-xs text-slate-400">(hidden)</span>
                                    )}
                                </span>
                                <StatusBadge status={tc.status} />
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-slate-500">Input</span>
                                    <pre className="mt-1 rounded border border-slate-100 bg-white p-2 font-mono text-slate-700">
                                        {tc.input}
                                    </pre>
                                </div>
                                <div>
                                    <span className="text-slate-500">Expected Output</span>
                                    <pre className="mt-1 rounded border border-slate-100 bg-white p-2 font-mono text-slate-700">
                                        {tc.expectedOutput}
                                    </pre>
                                </div>
                                {tc.actualOutput !== undefined && (
                                    <div className="md:col-span-2">
                                        <span className="text-slate-500">Actual Output</span>
                                        <pre className="mt-1 rounded border border-slate-100 bg-white p-2 font-mono text-slate-700">
                                            {tc.actualOutput}
                                        </pre>
                                    </div>
                                )}
                                {tc.error && (
                                    <div className="md:col-span-2 text-rose-600">{tc.error}</div>
                                )}
                                {tc.executionTimeMs !== undefined && (
                                    <div className="md:col-span-2 text-slate-400">
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

function QueryOutputPanel({ result }: { result: QueryExecutionResult }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h4 className="font-semibold text-slate-900">Query Validation</h4>
            </div>

            <div className="p-4 space-y-4">
                {result.keywordViolations && result.keywordViolations.length > 0 && (
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800">
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
                    <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-sm text-rose-700">
                        <FaExclamationTriangle className="inline-block mr-1.5" />
                        {result.error}
                    </div>
                )}

                {result.matchesExpected !== undefined && (
                    <div
                        className={twMerge(
                            "inline-flex items-center gap-2 text-sm font-medium",
                            result.matchesExpected ? "text-emerald-700" : "text-amber-700"
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
                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                        <table className="min-w-full text-xs">
                            <thead className="bg-slate-50">
                                <tr>
                                    {Object.keys(result.rows[0]).map((key) => (
                                        <th
                                            key={key}
                                            className="border-b border-slate-100 px-3 py-2 text-left font-semibold text-slate-600"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {result.rows.map((row, idx) => (
                                    <tr key={idx} className="even:bg-slate-50/50">
                                        {Object.values(row).map((value, vidx) => (
                                            <td
                                                key={vidx}
                                                className="border-b border-slate-100 px-3 py-2 text-slate-700"
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
                    <div className="text-xs text-slate-500">
                        Execution time: {result.executionTimeMs} ms
                        {result.rowCount !== undefined && ` · ${result.rowCount} rows`}
                    </div>
                )}
            </div>
        </div>
    );
}
