import type { AssessmentInterface, GetAssessmentsParams } from "../../types/assessmentTypes";
import type { UserInterface } from "../../types/authTypes";
import type { QuestionInterface } from "../../types/questionTypes";
import type { ApiResponse } from "../../types/types"
import type { UserAssessmentAnswerInterface, UserAssessmentInterface } from "../../types/userAssessmentTypes";
import api from "./api"

export const getProfile = async () => {
    try {
        const response = await api.get<ApiResponse<UserInterface>>('/user/profile')
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessments = async (params?: GetAssessmentsParams) => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface[]>>('/user/assessments', { params })
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessment = async (id: string) => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface>>(`/user/assessments/${id}`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const updateProfile = async (data: Partial<UserInterface>) => {
    try {
        const response = await api.put<ApiResponse<UserInterface>>('/user/profile', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const startAssessment = async (id: string) => {
    try {
        const response = await api.post<ApiResponse<UserAssessmentInterface>>(`/user/assessments/${id}/start`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const submitAssessment = async (id: string, data: UserAssessmentAnswerInterface[]) => {
    try {
        const response = await api.post<ApiResponse<UserAssessmentInterface>>(`/user/assessments/${id}/submit`, data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessmentQuestions = async (id: string) => {
    try {
        const response = await api.get<ApiResponse<QuestionInterface[]>>(`/user/assessments/${id}/questions`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getUserAssessment = async (userId: string, assessId: string) => {
    try {
        const response = await api.get<ApiResponse<UserAssessmentInterface>>(`/user/${userId}/assessment/${assessId}`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const syncAssessmentAnswers = async (userId: string, assessId: string, answers: Omit<UserAssessmentAnswerInterface, 'timeSpentInSeconds' | 'marksObtained'>[]) => {
    try {
        const response = await api.put<ApiResponse<UserAssessmentInterface>>(`/user/${userId}/assessment/${assessId}`, answers)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}