import type { ApiResponse, UserInterface } from "../../types/types"
import api from "./api"

export const getProfile = async () => {
    try {
        const response = await api.get<ApiResponse<UserInterface>>('/auth/profile')
        return response.data;
    } catch (error) {
        console.log('Error in getProfile', error)
        const apiError = error as ApiResponse<null>
        return apiError.data;
    }
}