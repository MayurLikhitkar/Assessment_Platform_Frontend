import { ProgrammingLanguage } from "../types/questionTypes";

export const capitalizeFirstLetter = (str: string): string => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
};

export const formatProgrammingLanguage = (lang: ProgrammingLanguage): string => {
    const map: Record<ProgrammingLanguage, string> = {
        javascript: "JavaScript",
        typescript: "TypeScript",
        python: "Python",
        java: "Java",
        cpp: "C++",
        c: "C",
    };
    return map[lang] || lang;
};