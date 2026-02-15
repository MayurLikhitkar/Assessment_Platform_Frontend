import type { ApiResponse, UserInterface } from "../../types/types"
import api from "./api"
import type { ChangePasswordRequest } from '../../types/authTypes';

export const getProfile = async () => {
    try {
        const response = await api.get<ApiResponse<UserInterface>>('/auth/profile')
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

export const changePassword = async (data: ChangePasswordRequest) => {
    try {
        const response = await api.put<ApiResponse<null>>('/auth/change-password', data)
        return response.data;
    } catch (error) {
        const apiError = error as ApiResponse<null>
        throw apiError;
    }
}