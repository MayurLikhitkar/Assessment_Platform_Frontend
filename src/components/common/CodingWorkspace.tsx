import React, { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
    RiAlertLine,
    RiCheckboxCircleFill,
    RiCloseCircleFill,
    RiCpuLine,
    RiLoader4Line,
    RiPlayLargeFill,
    RiSendPlaneFill,
    RiTerminalBoxLine,
    RiTimerFlashLine,
} from "react-icons/ri";
import {
    isLanguageExecutable,
    normalizeOutput,
    runJavaScript,
    stripBasicTypeScript,
    type RunResult,
} from "../utils/codeRunner";
import { ProgrammingLanguage, type QuestionInterface } from "../../types/questionTypes";
import CodeEditor from "./CodeEditor";

interface TestOutcome {
    status: "idle" | "running" | "pass" | "fail" | "error" | "mle" | "timeout";
    run?: RunResult;
}

const LANGUAGE_LABEL: Record<ProgrammingLanguage, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    csharp: "C#",
    r: "r",
    html: "html",
    css: "css",
};

interface Props {
    question: QuestionInterface;
    onAttempted: () => void;
}

const statusStyles: Record<TestOutcome["status"], string> = {
    idle: "border-border bg-white text-ink-light",
    running: "border-accent/40 bg-accent-light text-accent-dark",
    pass: "border-success/40 bg-success-light text-success-dark",
    fail: "border-error/40 bg-error-light text-error-dark",
    error: "border-error/40 bg-error-light text-error-dark",
    mle: "border-warn/40 bg-warn-light text-warn-dark",
    timeout: "border-warn/40 bg-warn-light text-warn-dark",
};

const statusLabel: Record<TestOutcome["status"], string> = {
    idle: "Not run",
    running: "Running…",
    pass: "Passed",
    fail: "Failed",
    error: "Runtime Error",
    mle: "Memory Limit Exceeded",
    timeout: "Time Limit Exceeded",
};

const CodingWorkspace: React.FC<Props> = ({ question, onAttempted }) => {
    const fields = question.codingFields!;
    const languages = fields.programmingLanguages;
    const [language, setLanguage] = useState<ProgrammingLanguage>(languages[0]);
    const [codeByLanguage, setCodeByLanguage] = useState<Partial<Record<ProgrammingLanguage, string>>>(
        () => ({ ...fields.starterCode })
    );
    const [tab, setTab] = useState<"public" | "custom">("public");
    const [customInput, setCustomInput] = useState(fields.testCases[0]?.input ?? "");
    const [customOutcome, setCustomOutcome] = useState<TestOutcome>({ status: "idle" });
    const [isRunningCustom, setIsRunningCustom] = useState(false);

    const [publicOutcomes, setPublicOutcomes] = useState<Record<number, TestOutcome>>({});
    const [allOutcomes, setAllOutcomes] = useState<Record<number, TestOutcome>>({});
    const [isRunningPublic, setIsRunningPublic] = useState(false);
    const [isRunningAll, setIsRunningAll] = useState(false);
    const [hasSubmittedAll, setHasSubmittedAll] = useState(false);

    const code = codeByLanguage[language] ?? "";
    const executable = isLanguageExecutable(language);
    const memoryLimitKB = (fields.memoryLimitInMB ?? 128) * 1024;
    const timeoutMs = (question.timeLimitInSeconds ?? 4) * 1000;

    const publicTests = useMemo(
        () => fields.testCases.filter((t) => t.isPublic),
        [fields.testCases]
    );

    const setCode = (value: string) => {
        setCodeByLanguage((prev) => ({ ...prev, [language]: value }));
        onAttempted();
    };

    const executeAgainst = async (rawCode: string, input: string) => {
        const source = language === ProgrammingLanguage.TYPESCRIPT ? stripBasicTypeScript(rawCode) : rawCode;
        return runJavaScript(source, input, timeoutMs);
    };

    const classifyRun = (run: RunResult, expected?: string): TestOutcome => {
        if (run.timedOut) return { status: "timeout", run };
        if (!run.success) return { status: "error", run };
        if (run.memoryKB > memoryLimitKB) return { status: "mle", run };
        if (expected === undefined) return { status: "pass", run };
        const pass = normalizeOutput(run.result ?? "") === normalizeOutput(expected);
        return { status: pass ? "pass" : "fail", run };
    };

    const runPublicTests = async () => {
        if (!executable) return;
        setIsRunningPublic(true);
        const nextOutcomes: Record<number, TestOutcome> = {};
        for (let i = 0; i < publicTests.length; i++) {
            nextOutcomes[i] = { status: "running" };
            setPublicOutcomes({ ...nextOutcomes });
            const run = await executeAgainst(code, publicTests[i].input);
            nextOutcomes[i] = classifyRun(run, publicTests[i].expectedOutput);
            setPublicOutcomes({ ...nextOutcomes });
        }
        setIsRunningPublic(false);
    };

    const runAllTests = async () => {
        if (!executable) return;
        setIsRunningAll(true);
        setHasSubmittedAll(true);
        const nextOutcomes: Record<number, TestOutcome> = {};
        for (let i = 0; i < fields.testCases.length; i++) {
            nextOutcomes[i] = { status: "running" };
            setAllOutcomes({ ...nextOutcomes });
            const run = await executeAgainst(code, fields.testCases[i].input);
            nextOutcomes[i] = classifyRun(run, fields.testCases[i].expectedOutput);
            setAllOutcomes({ ...nextOutcomes });
        }
        setIsRunningAll(false);
    };

    const runCustom = async () => {
        if (!executable) return;
        setIsRunningCustom(true);
        setCustomOutcome({ status: "running" });
        const run = await executeAgainst(code, customInput);
        setCustomOutcome(classifyRun(run));
        setIsRunningCustom(false);
    };

    const allPassedCount = Object.values(allOutcomes).filter((o) => o.status === "pass").length;
    const maxMemoryUsed = Math.max(
        0,
        ...Object.values(allOutcomes).map((o) => o.run?.memoryKB ?? 0),
        ...Object.values(publicOutcomes).map((o) => o.run?.memoryKB ?? 0)
    );

    return (
        <div className="space-y-4">
            {/* Constraints */}
            {fields.constraints && fields.constraints.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-xl border border-accent-light bg-accent-light/60 p-4 text-sm">
                    <RiAlertLine className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark" />
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-dark">Constraints</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-ink-light">
                            {fields.constraints.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-ink-light">Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as ProgrammingLanguage)}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-accent"
                    >
                        {languages.map((l) => (
                            <option key={l} value={l}>
                                {LANGUAGE_LABEL[l]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-light">
                    <RiCpuLine className="h-4 w-4 text-accent" />
                    Memory limit: {fields.memoryLimitInMB ?? 128} MB
                    <span className="text-ink-faint">·</span>
                    <RiTimerFlashLine className="h-4 w-4 text-accent" />
                    {(question.timeLimitInSeconds ?? 4)}s / test
                </div>
            </div>

            {!executable && (
                <div className="flex items-start gap-2.5 rounded-xl border border-warn-light bg-warn-light/70 p-3 text-sm text-warn-dark">
                    <RiAlertLine className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        In-browser execution is available for <b>JavaScript</b> and <b>TypeScript</b> only in this demo (no
                        server-side sandbox is wired up for {LANGUAGE_LABEL[language]}). Switch language to run &amp; grade your
                        code, or keep drafting your {LANGUAGE_LABEL[language]} solution here.
                    </p>
                </div>
            )}

            <CodeEditor value={code} onChange={setCode} language={LANGUAGE_LABEL[language]} minHeight={240} />

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={runPublicTests}
                    disabled={!executable || isRunningPublic || isRunningAll}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isRunningPublic ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiPlayLargeFill className="h-4 w-4 text-accent" />}
                    Run Public Tests
                </button>
                <button
                    onClick={runAllTests}
                    disabled={!executable || isRunningPublic || isRunningAll}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isRunningAll ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiSendPlaneFill className="h-4 w-4" />}
                    Run All Tests
                </button>

                <div className="ml-auto flex rounded-lg border border-border bg-white p-1 text-xs font-bold">
                    <button
                        onClick={() => setTab("public")}
                        className={twMerge("rounded-md px-3 py-1.5", tab === "public" ? "bg-accent text-white" : "text-ink-light")}
                    >
                        Test Results
                    </button>
                    <button
                        onClick={() => setTab("custom")}
                        className={twMerge("rounded-md px-3 py-1.5", tab === "custom" ? "bg-accent text-white" : "text-ink-light")}
                    >
                        Custom Run
                    </button>
                </div>
            </div>

            {/* Memory gauge */}
            {maxMemoryUsed > 0 && (
                <div className="rounded-xl border border-border bg-white p-3">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-ink-light">
                        <span>Peak estimated memory usage</span>
                        <span>
                            {(maxMemoryUsed / 1024).toFixed(2)} MB / {fields.memoryLimitInMB ?? 128} MB
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div
                            className={twMerge(
                                "h-full rounded-full transition-all",
                                maxMemoryUsed > memoryLimitKB ? "bg-error" : "bg-success"
                            )}
                            style={{ width: `${Math.min(100, (maxMemoryUsed / memoryLimitKB) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {tab === "public" ? (
                <div className="space-y-3">
                    {hasSubmittedAll && (
                        <div
                            className={twMerge(
                                "flex items-center justify-between rounded-xl border p-4 text-sm font-bold",
                                allPassedCount === fields.testCases.length
                                    ? "border-success/40 bg-success-light text-success-dark"
                                    : "border-warn/40 bg-warn-light text-warn-dark"
                            )}
                        >
                            <span>
                                {allPassedCount} / {fields.testCases.length} test cases passed
                            </span>
                            {allPassedCount === fields.testCases.length && <RiCheckboxCircleFill className="h-5 w-5" />}
                        </div>
                    )}

                    <div className="grid gap-3">
                        {(hasSubmittedAll ? fields.testCases : publicTests).map((tc, idx) => {
                            const outcome = hasSubmittedAll ? allOutcomes[idx] : publicOutcomes[idx];
                            const status = outcome?.status ?? "idle";
                            const isHidden = hasSubmittedAll && !tc.isPublic;
                            return (
                                <div key={idx} className={twMerge("rounded-xl border p-3.5 transition", statusStyles[status])}>
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                                        <span>
                                            Test Case {idx + 1} {isHidden && <span className="opacity-70">(hidden)</span>}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {status === "running" && <RiLoader4Line className="h-3.5 w-3.5 animate-spin" />}
                                            {status === "pass" && <RiCheckboxCircleFill className="h-3.5 w-3.5" />}
                                            {(status === "fail" || status === "error") && <RiCloseCircleFill className="h-3.5 w-3.5" />}
                                            {statusLabel[status]}
                                        </span>
                                    </div>
                                    {!isHidden && (
                                        <div className="mt-2 grid gap-2 font-mono text-xs sm:grid-cols-2">
                                            <div>
                                                <p className="mb-0.5 font-sans font-semibold uppercase tracking-wide text-[10px] opacity-70">Input</p>
                                                <pre className="overflow-x-auto rounded-lg bg-black/5 p-2">{tc.input}</pre>
                                            </div>
                                            <div>
                                                <p className="mb-0.5 font-sans font-semibold uppercase tracking-wide text-[10px] opacity-70">Expected</p>
                                                <pre className="overflow-x-auto rounded-lg bg-black/5 p-2">{tc.expectedOutput}</pre>
                                            </div>
                                            {outcome?.run && (
                                                <div className="sm:col-span-2">
                                                    <p className="mb-0.5 font-sans font-semibold uppercase tracking-wide text-[10px] opacity-70">
                                                        Your Output {outcome.run.error && "(error)"}
                                                    </p>
                                                    <pre className="overflow-x-auto rounded-lg bg-black/5 p-2 whitespace-pre-wrap">
                                                        {outcome.run.error ?? outcome.run.result ?? "—"}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {outcome?.run && (
                                        <div className="mt-2 flex gap-4 font-sans text-[11px] font-semibold opacity-80">
                                            <span>⏱ {outcome.run.timeMs} ms</span>
                                            <span>📦 {(outcome.run.memoryKB / 1024).toFixed(2)} MB</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-ink-light">
                        Provide any input to sanity-check your solve() function before running the graded tests.
                    </p>
                    <SimpleCodeEditor
                        value={customInput}
                        onChange={setCustomInput}
                        language="input"
                        minHeight={90}
                    />
                    <button
                        onClick={runCustom}
                        disabled={!executable || isRunningCustom}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRunningCustom ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiTerminalBoxLine className="h-4 w-4 text-accent" />}
                        Run
                    </button>

                    {customOutcome.status !== "idle" && (
                        <div className={twMerge("rounded-xl border p-3.5", statusStyles[customOutcome.status === "running" ? "running" : customOutcome.run?.success ? "idle" : "error"])}>
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-light">Output</p>
                            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/5 p-2 font-mono text-xs">
                                {customOutcome.run?.error ?? customOutcome.run?.result ?? (customOutcome.status === "running" ? "Running…" : "—")}
                            </pre>
                            {customOutcome.run?.logs && customOutcome.run.logs.length > 0 && (
                                <>
                                    <p className="mb-1 mt-2 text-xs font-bold uppercase tracking-wide text-ink-light">console.log</p>
                                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/5 p-2 font-mono text-xs">
                                        {customOutcome.run.logs.join("\n")}
                                    </pre>
                                </>
                            )}
                            {customOutcome.run && (
                                <div className="mt-2 flex gap-4 text-[11px] font-semibold text-ink-light">
                                    <span>⏱ {customOutcome.run.timeMs} ms</span>
                                    <span>📦 {(customOutcome.run.memoryKB / 1024).toFixed(2)} MB</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodingWorkspace;