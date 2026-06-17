import type { AssessmentInterface, GetAssessmentsParams } from "../../types/assessmentTypes";
import type { UserInterface } from "../../types/authTypes";
import type { QuestionInterface } from "../../types/questionTypes";
import type { ApiResponse } from "../../types/types"
import type { UserAssessmentAnswerInterface, UserAssessmentInterface } from "../../types/userAssessmentTypes";
import api from "./api"

export const getAssessments = async (params: GetAssessmentsParams = { isPublic: true, isActive: true }) => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface[]>>('/assessments', { params })
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessment = async (id: string | number) => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface>>(`/assessments/${id}`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const updateProfile = async (data: Partial<UserInterface>) => {
    try {
        const response = await api.put<ApiResponse<UserInterface>>('/auth/profile', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const startAssessment = async (id: string | number) => {
    try {
        const response = await api.post<ApiResponse<UserAssessmentInterface>>(`/assessments/${id}/start`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const submitAssessment = async (id: string | number, data: UserAssessmentAnswerInterface[]) => {
    try {
        const response = await api.post<ApiResponse<UserAssessmentInterface>>(`/assessments/${id}/submit`, data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}

export const getAssessmentQuestions = async (id: string | number) => {
    try {
        const response = await api.get<ApiResponse<QuestionInterface[]>>(`assessments/${id}/questions`)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}