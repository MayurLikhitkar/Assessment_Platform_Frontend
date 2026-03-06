import type { ApiResponse, UserInterface } from "../../types/types"
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
            api.get<ApiResponse<Record<string, unknown>[]>>('/assessments').catch(() => null),
        ]);

        return {
            totalUsers: usersRes?.data?.data?.length ?? 0,
            totalAssessments: assessmentsRes?.data?.data?.length ?? 0,
        };
    } catch {
        return { totalUsers: 0, totalAssessments: 0 };
    }
}
