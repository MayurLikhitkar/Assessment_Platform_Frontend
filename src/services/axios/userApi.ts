import type { AssessmentInterface } from "../../types/assessmentTypes";
import type { UserInterface } from "../../types/authTypes";
import type { ApiResponse, UserAssessmentInterface } from "../../types/types"
import api from "./api"

export const getAssessments = async () => {
    try {
        const response = await api.get<ApiResponse<AssessmentInterface[]>>('/assessments')
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
