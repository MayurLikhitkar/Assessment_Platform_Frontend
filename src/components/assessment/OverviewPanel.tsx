import { RiAwardLine, RiBrainLine, RiTimeLine, RiShieldCheckLine, RiRefreshLine, RiSave2Line, RiArrowRightLine, RiClockwiseLine } from "react-icons/ri";
import { FaMicrophone } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { TbBrowserX } from "react-icons/tb";
import type { AssessmentInterface } from "../../types/assessmentTypes";
import { ContentBox } from "../ui/Page";
import { MdQuiz } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import Button from "../ui/Button";

interface OverviewPanelProps {
    assessment: AssessmentInterface;
    onNext: () => void;
}
const OverviewPanel: React.FC<OverviewPanelProps> = ({ assessment, onNext }) => {
    const enableProctoring = assessment.requireWebcam || assessment.requireMicrophone
        || !assessment.allowTabSwitch || !assessment.allowFullscreenExit || assessment.enableRecording;

    const meta = [
        { Icon: RiTimeLine, label: 'Duration', value: `${assessment.durationInMinutes} min` },
        { Icon: RiAwardLine, label: 'Total marks', value: `${assessment.totalMarks}` },
        { Icon: MdQuiz, label: 'Questions', value: assessment.questions.length },
        { Icon: RiBrainLine, label: 'Difficulty', value: assessment.difficulty },
    ];

    const rules = [
        { icon: RiRefreshLine, bg: 'bg-warn-main/10 text-warn-dark', active: !assessment.allowTabSwitch, text: 'Switching tabs or leaving the window will be flagged as a violation and may terminate your session.' },
        { icon: IoVideocam, bg: 'bg-error-main/10 text-error-dark', active: assessment.requireWebcam, text: 'Your webcam will be active throughout for identity verification and proctoring.' },
        { icon: FaMicrophone, bg: 'bg-primary-main/10 text-primary-dark', active: assessment.requireMicrophone, text: 'Microphone is monitored to detect audio anomalies.' },
        { icon: RiSave2Line, bg: 'bg-success-main/10 text-success-dark', active: true, text: 'Answers are auto-saved as you progress. You can revisit any question before submitting.' },
        { icon: RiClockwiseLine, bg: 'bg-secondary-main/10 text-secondary-dark', active: true, text: 'When the timer runs out, the assessment is submitted automatically with your current answers.' },
        { icon: TbBrowserX, bg: 'bg-muted-main text-text-light', active: !assessment.allowFullscreenExit, text: 'Do not close or refresh your browser — your session may be lost.' },
    ].filter(r => r.active);

    return (
        <>
            <ContentBox className="space-y-4">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    {assessment.type.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-md bg-muted-light border border-border-light text-text-light uppercase">
                            {t}
                        </span>
                    ))}
                    {enableProctoring && (
                        <span className="px-2.5 py-1 rounded-md bg-error-light/10 border border-error-light text-error-dark flex items-center gap-1">
                            <RiShieldCheckLine className="w-3 h-3" /> Proctored
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold text-text-main">{assessment.title}</h1>
                {assessment.description && (
                    <p className="text-sm text-text-light">{assessment.description}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {meta.map(s => (
                        <div key={s.label} className="bg-muted-light rounded-xl py-3 px-4 border border-border-light/70">
                            <span className="flex items-center gap-1 text-[11px] text-text-light mb-1">
                                <s.Icon className="w-3.5 h-3.5" /> {s.label}
                            </span>
                            <span className="text-lg font-semibold text-text-main capitalize">{s.value}</span>
                        </div>
                    ))}
                </div>
            </ContentBox>

            <ContentBox className="space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-text-light">
                    Rules &amp; guidelines
                </h2>
                {rules.map(r => (
                    <div key={r.text} className="flex items-start gap-3 text-sm">
                        <span className={twMerge('p-2 rounded-full shrink-0', r.bg)}>
                            <r.icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="leading-relaxed pt-1.5">{r.text}</span>
                    </div>
                ))}
            </ContentBox>

            <Button variant="primary" onClick={onNext} className="w-full justify-center py-3 gap-2 rounded-xl text-sm">
                Continue <RiArrowRightLine className="w-4 h-4" />
            </Button>
        </>
    );
};

export default OverviewPanel;