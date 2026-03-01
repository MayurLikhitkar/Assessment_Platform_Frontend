import type { ApiResponse, UserAssessmentInterface, UserInterface } from "../../types/types"
import api from "./api"

export const getAssessments = async () => {
    try {
        const response = await api.get<ApiResponse<UserAssessmentInterface[]>>('/assessments')
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
