import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { BASE_API_URL } from '../../config/envConfig';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '../tokenService';
import type { LoginResponse } from '../../types/authTypes';
import type { ApiResponse } from '../../types/types';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
}

interface QueueItem {
    resolve: (value: string | null) => void;
    reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
const MAX_RETRY_COUNT = 3;

export const AUTH_EVENTS = {
    LOGOUT: 'auth:logout',
} as const;

// Process queued requests
const processQueue = (error: Error | null, token: string | null): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

const handleAuthFailure = (): void => {
    clearTokens();
    isRefreshing = false;
    failedQueue = [];
    globalThis.dispatchEvent(new CustomEvent(AUTH_EVENTS.LOGOUT));
};

const normalizeError = (error: AxiosError): ApiResponse<null> => {

    if (error.response?.data) {
        return error.response.data as ApiResponse<null>;
    }

    if (error.request) {
        return {
            success: false,
            responseMessage: 'Unable to connect to server',
            errorMessage: 'No response received from server',
            error
        };
    }

    return {
        success: false,
        responseMessage: 'An error occurred',
        errorMessage: error.message || 'An error occurred',
        error
    };
};

const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const handle401Error = async (
    originalRequest: ExtendedAxiosRequestConfig
): Promise<unknown> => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then((token) => {
                if (token && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return api(originalRequest);
            })
            .catch((err) => Promise.reject(normalizeError(err)));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
        const refreshTokenValue = getRefreshToken();

        if (!refreshTokenValue) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post<LoginResponse>(
            `${BASE_API_URL}/auth/refresh`,
            { refreshToken: refreshTokenValue },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const { accessToken } = response.data;
        setAccessToken(accessToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
    } catch (refreshError) {
        const error = refreshError instanceof AxiosError
            ? refreshError
            : refreshError instanceof Error
                ? refreshError
                : new Error('Token refresh failed');
        processQueue(error, null);
        handleAuthFailure();
        return Promise.reject(normalizeError(error));
    } finally {
        isRefreshing = false;
    }
};

const handleRateLimitError = async (
    originalRequest: ExtendedAxiosRequestConfig,
    error: AxiosError
): Promise<unknown> => {
    const retryCount = originalRequest._retryCount || 0;

    if (retryCount >= MAX_RETRY_COUNT) {
        throw normalizeError(error);
    }

    originalRequest._retryCount = retryCount + 1;

    const retryAfter = Number.parseInt(
        (error.response?.headers as Record<string, string>)['retry-after'] || '1',
        10
    ) * 1000;
    const delay = Math.min(retryAfter, 2 ** retryCount * 1000, 30000);

    await sleep(delay);
    return api(originalRequest);
};

const handleResponseError = async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig ?? null;
    // console.log('first', error)
    // console.log('first', originalRequest)
    if (!originalRequest) {
        return Promise.reject(normalizeError(error));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        return handle401Error(originalRequest);
    }

    // Uncomment if rate limiting is needed
    // if (error.response?.status === 429) {
    //   return handleRateLimitError(originalRequest, error);
    // }

    return Promise.reject(normalizeError(error));
};

const api = axios.create({
    baseURL: BASE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(normalizeError(error));
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    handleResponseError
);


export default api;