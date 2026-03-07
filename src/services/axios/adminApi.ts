import type { ApiResponse, AssessmentInterface, Question, UserInterface } from "../../types/types"
import api from "./api"

export const getUsers = async () => {
    try {
        const response = await api.get<ApiResponse<UserInterface[]>>('/auth/users')
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
        const response = await api.get<ApiResponse<AssessmentInterface[]>>('/assessments')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getQuestions = async () => {
    try {
        const response = await api.get<ApiResponse<Question[]>>('/questions')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const createQuestion = async (data: Partial<Question>) => {
    try {
        const response = await api.post<ApiResponse<Question>>('/questions', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const deleteQuestion = async (id: number) => {
    try {
        const response = await api.delete<ApiResponse<null>>(`/questions/${id}`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}
