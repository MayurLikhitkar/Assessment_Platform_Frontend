import type { AssessmentInterface } from "../../types/assessmentTypes";
import type { UserInterface } from "../../types/authTypes";
import type { QuestionInterface } from "../../types/questionTypes";
import type { ApiResponse } from "../../types/types"
import api from "./api"

export const getUsers = async () => {
    try {
        const response = await api.get<ApiResponse<UserInterface[]>>('/admin/users')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const createUser = async (data: Partial<UserInterface>) => {
    try {
        const response = await api.post<ApiResponse<UserInterface>>('/admin/addUser', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAdminStats = async () => {
    try {
        const [usersRes, assessmentsRes] = await Promise.all([
            api.get<ApiResponse<UserInterface[]>>('/auth/users').catch(() => null),
            api.get<ApiResponse<AssessmentInterface[]>>('/assessments').catch(() => null),
        ]);

        return {
            totalUsers: usersRes?.data?.data?.length ?? 0,
            totalAssessments: assessmentsRes?.data?.data?.length ?? 0,
        };
    } catch {
        return { totalUsers: 0, totalAssessments: 0 };
    }
}

export const getAdminAssessments = async () => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface[]>>('/admin/assessments')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const createAssessment = async (data: Partial<AssessmentInterface>) => {
    try {
        const response = await api.post<ApiResponse<AssessmentInterface>>('/admin/assessments', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessmentById = async (id: string) => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface>>(`/admin/assessments/${id}`);
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
};

export const updateAssessment = async ({ id, data }: { id: string, data: Partial<AssessmentInterface> }) => {
    try {
        const response = await api.put<ApiResponse<AssessmentInterface>>(`/admin/assessments/${id}`, data);
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
};

export const getQuestions = async () => {
    try {
        const response = await api.get<ApiResponse<QuestionInterface[]>>('/admin/questions')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const createQuestion = async (data: Partial<QuestionInterface>) => {
    try {
        const response = await api.post<ApiResponse<QuestionInterface>>('/admin/questions', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const deleteQuestion = async (id: string) => {
    try {
        const response = await api.delete<ApiResponse<null>>(`/admin/questions/${id}`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getQuestionById = async (id: string) => {
    try {
        const response = await api.get<ApiResponse<QuestionInterface>>(`/admin/questions/${id}`);
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
};

export const updateQuestion = async ({ id, data }: { id: string, data: Partial<QuestionInterface> }) => {
    try {
        const response = await api.put<ApiResponse<QuestionInterface>>(`/admin/questions/${id}`, data);
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
};