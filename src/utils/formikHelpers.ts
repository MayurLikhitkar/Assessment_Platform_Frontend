// utils/formikHelpers.ts
import type { FormikErrors, FormikTouched } from "formik";
import type { QuestionInterface } from "../types/questionTypes";

export const getOptionsError = (
    errors: FormikErrors<QuestionInterface>,
    touched: FormikTouched<QuestionInterface>,
    index?: number,
    field?: string
): string | undefined => {
    const optionsError = errors.options;

    // Array-level error (string) - from .min(), .max(), .test()
    if (typeof optionsError === 'string') {
        return optionsError;
    }

    // Field-level error inside an option
    if (Array.isArray(optionsError) && index !== undefined && field) {
        const optionError = optionsError[index] as FormikErrors<{ text: string; isCorrect: boolean }>;
        return optionError?.[field as keyof typeof optionError];
    }

    return undefined;
};