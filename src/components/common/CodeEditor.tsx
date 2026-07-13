import { useCallback, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import {
    Play,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Cpu,
    Terminal,
    ChevronDown,
    ChevronUp,
    MemoryStick,
} from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import type {
    CodingFields,
    CodeExecutionResult,
} from "@/types/questionTypes";
import { ProgrammingLanguage } from "@/types/questionTypes";
import { executeCode, languageLabels } from "@/services/executionService";

interface CodeEditorProps {
    questionId: string;
    fields: CodingFields;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

function languageExtension(language: ProgrammingLanguage) {
    switch (language) {
        case "javascript":
        case "typescript":
            return javascript({ jsx: false, typescript: language === "typescript" });
        case "python":
            return python();
        default:
            return javascript();
    }
}

export default function CodeEditor({
    questionId,
    fields,
    value,
    onChange,
    className,
}: CodeEditorProps) {
    const [language, setLanguage] = useState<ProgrammingLanguage>(
        fields.programmingLanguages[0] ?? ProgrammingLanguage.JAVASCRIPT
    );
    const [result, setResult] = useState<CodeExecutionResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showDetails, setShowDetails] = useState(true);

    const starterCode = useMemo(
        () => fields.starterCode?.[language] ?? "",
        [fields.starterCode, language]
    );

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setResult(null);
        try {
            const res = await executeCode(language, value || starterCode, fields);
            setResult(res);
        } finally {
            setIsRunning(false);
        }
    }, [language, value, starterCode, fields]);

    const allPassed = result && result.passedCount === result.totalCount;
    const hasErrors = result && (result.error || result.testCases.some((t) => t.error));

    return (
        <div className={cn("space-y-4", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Language</label>
                    <select
                        id={`lang-${questionId}`}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        {fields.programmingLanguages.map((lang) => (
                            <option key={lang} value={lang}>
                                {languageLabels[lang]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                    {fields.memoryLimitInMB && (
                        <span className="flex items-center gap-1">
                            <MemoryStick className="h-3.5 w-3.5" />
                            Memory limit: {fields.memoryLimitInMB} MB
                        </span>
                    )}
                    {fields.constraints && fields.constraints.length > 0 && (
                        <span className="hidden sm:inline">
                            {fields.constraints.length} constraint
                            {fields.constraints.length > 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    isLoading={isRunning}
                    onClick={handleRun}
                    className="ml-auto"
                >
                    <Play className="h-4 w-4" />
                    Run Tests
                </Button>
            </div>

            {/* Editor */}
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <CodeMirror
                    value={value || starterCode}
                    height="320px"
                    theme={vscodeDark}
                    extensions={[languageExtension(language)]}
                    onChange={onChange}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightActiveLine: true,
                        foldGutter: true,
                    }}
                    className="text-sm"
                />
            </div>

            {/* Constraints */}
            {fields.constraints && fields.constraints.length > 0 && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                        Constraints
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-indigo-900">
                        {fields.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Results */}
            {result && (
                <div
                    className={cn(
                        "overflow-hidden rounded-xl border",
                        allPassed && !hasErrors
                            ? "border-emerald-200 bg-emerald-50/50"
                            : hasErrors || result.memoryLimitExceeded
                                ? "border-rose-200 bg-rose-50/50"
                                : "border-amber-200 bg-amber-50/50"
                    )}
                >
                    <button
                        onClick={() => setShowDetails((s) => !s)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                        <div className="flex items-center gap-3">
                            {allPassed && !hasErrors ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : hasErrors || result.memoryLimitExceeded ? (
                                <XCircle className="h-5 w-5 text-rose-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                            <span className="font-semibold text-slate-900">
                                {result.memoryLimitExceeded
                                    ? "Memory Limit Exceeded"
                                    : `${result.passedCount}/${result.totalCount} test cases passed`}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-3 text-xs text-slate-500 sm:flex">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {result.executionTimeMs} ms
                                </span>
                                <span className="flex items-center gap-1">
                                    <Cpu className="h-3.5 w-3.5" />
                                    {result.memoryUsedMB} MB
                                </span>
                            </div>
                            {showDetails ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                        </div>
                    </button>

                    {showDetails && (
                        <div className="border-t border-slate-200 px-4 py-3">
                            {result.error && (
                                <div className="mb-3 flex items-start gap-2 rounded-lg bg-rose-100 p-3 text-sm text-rose-800">
                                    <Terminal className="mt-0.5 h-4 w-4 shrink-0" />
                                    <pre className="whitespace-pre-wrap font-mono">{result.error}</pre>
                                </div>
                            )}

                            <div className="space-y-2">
                                {result.testCases.map((tc, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "rounded-lg border p-3 text-sm",
                                            tc.passed
                                                ? "border-emerald-200 bg-emerald-50"
                                                : "border-rose-200 bg-rose-50"
                                        )}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-medium text-slate-700">
                                                Test case {idx + 1}
                                            </span>
                                            <Badge variant={tc.passed ? "success" : "danger"}>
                                                {tc.passed ? "Passed" : "Failed"}
                                            </Badge>
                                        </div>
                                        <div className="grid gap-2 font-mono text-xs text-slate-600">
                                            {tc.isPublic ? (
                                                <>
                                                    <div>
                                                        <span className="font-semibold">Input:</span>{" "}
                                                        {tc.input}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">Expected:</span>{" "}
                                                        {tc.expectedOutput}
                                                    </div>
                                                    {!tc.passed && (
                                                        <div>
                                                            <span className="font-semibold">Actual:</span>{" "}
                                                            {tc.actualOutput ?? "—"}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="italic text-slate-400">Hidden test case</div>
                                            )}
                                            {tc.error && (
                                                <div className="text-rose-700">{tc.error}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
