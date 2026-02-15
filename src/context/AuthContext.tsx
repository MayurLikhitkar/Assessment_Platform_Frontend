import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ApiResponse, UserInterface } from '../types/types';
import api from '../services/axios/api';
import type { AuthContextType, AuthState, LoginRequest, LoginResponse, RegisterRequest } from '../types/authTypes';
import { clearTokens, getAccessToken, getStoredUser, setStoredUser, setTokens } from '../services/tokenService';

const AUTH_EVENTS = {
    LOGOUT: 'auth:logout',
} as const;

const initialState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>(initialState);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = getStoredUser<UserInterface>();
                const accessToken = getAccessToken();

                if (storedUser && accessToken) {
                    setState({
                        user: storedUser,
                        isLoading: false,
                        isAuthenticated: true,
                        error: null,
                    });
                } else {
                    setState((prev) => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                clearTokens();
                setState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                    error: null,
                });
            }
        };

        initializeAuth();
    }, []);

    // Listen for forced logout events from API
    useEffect(() => {
        const handleForcedLogout = () => {
            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });
            globalThis.location.href = '/login';
        };
        globalThis.addEventListener(AUTH_EVENTS.LOGOUT, handleForcedLogout);
        return () => {
            globalThis.removeEventListener(AUTH_EVENTS.LOGOUT, handleForcedLogout);
        };
    }, []);

    const handleAuthSuccess = useCallback((response: LoginResponse) => {
        const { accessToken, refreshToken, user } = response;
        setTokens(accessToken, refreshToken);
        setStoredUser(user);
        setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
        });
    }, []);

    const login = useCallback(
        async (credentials: LoginRequest): Promise<void> => {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
                if (response.data.success && response.data.data) {
                    handleAuthSuccess(response.data.data);
                }
            } catch (error) {
                const apiError = error as ApiResponse<null>;
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: apiError,
                }));
                throw apiError;
            }
        },
        [handleAuthSuccess]
    );

    const register = useCallback(
        async (userData: RegisterRequest): Promise<void> => {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                await api.post<ApiResponse<null>>(
                    '/auth/register',
                    userData
                );
            } catch (error) {
                const apiError = error as ApiResponse<null>;
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: apiError,
                }));
                throw apiError;
            }
        },
        [handleAuthSuccess]
    );

    const logout = useCallback(() => {
        // Notify backend (fire and forget)
        api.post('/auth/logout').catch(() => {
            // Ignore logout API errors
        });

        clearTokens();

        setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        });

        globalThis.location.href = '/login';
    }, []);

    const updateUser = useCallback((userData: UserInterface) => {
        setState((prev) => {
            if (!prev.user) return prev;

            const updatedUser = { ...prev.user, ...userData };
            setStoredUser(updatedUser);

            return { ...prev, user: updatedUser };
        });
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    const contextValue = useMemo<AuthContextType>(
        () => ({
            ...state,
            login,
            register,
            logout,
            updateUser,
            clearError,
        }),
        [state, login, register, logout, updateUser, clearError]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;