import type { AssessmentInterface } from "../types/assessmentTypes";

export function defaultInstructions(assessment: Partial<AssessmentInterface>) {
    let instructions = `
1. Ensure stable internet connectivity.
2. Do not refresh or close the browser.
3. Timer cannot be paused once started.
4. Submit before time expires.
`;

    if (assessment.requireWebcam) {
        instructions += `\n• Webcam access is required during the assessment.`;
    }

    if (assessment.requireMicrophone) {
        instructions += `\n• Microphone access must remain enabled.`;
    }

    if (!assessment.allowTabSwitch) {
        instructions += `\n• Switching browser tabs is not allowed.`;
    }

    if (!assessment.allowFullscreenExit) {
        instructions += `\n• Exiting fullscreen mode is prohibited.`;
    }

    if (assessment.enableRecording) {
        instructions += `\n• Your session may be recorded for monitoring purposes.`;
    }

    instructions += `

Academic Integrity:

By proceeding, you agree to follow all examination rules.
Violation may result in termination of your assessment.
`;

    return instructions;
}