import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { BASE_API_URL } from '../config/envConfig';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './tokenService';
import type { ApiError, AuthResponse } from '../types/authTypes';

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
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
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

// Type guard to check if error response has expected shape
const isApiErrorResponse = (data: unknown): data is ApiError => {
    return (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as ApiError).message === 'string'
    );
};

const normalizeError = (error: AxiosError): ApiError => {

    if (error.response) {
        const responseData = error.response.data;

        if (isApiErrorResponse(responseData)) {
            return {
                message: responseData.message,
                statusCode: error.response.status,
                details: responseData.details,
            };
        }

        return {
            message: error.message || 'An error occurred',
            statusCode: error.response.status,
        };
    }

    if (error.request) {
        return {
            message: 'No response received from server',
            statusCode: 0,
        };
    }

    return {
        message: error.message || 'An error occurred',
        statusCode: 500,
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
            .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
        const refreshTokenValue = getRefreshToken();

        if (!refreshTokenValue) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post<AuthResponse>(
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
        const error =
            refreshError instanceof Error
                ? refreshError
                : new Error('Token refresh failed');
        processQueue(error, null);
        handleAuthFailure();
        return Promise.reject(error);
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

    const retryAfter =
        parseInt(error.response?.headers['retry-after'] || '1', 10) * 1000;
    const delay = Math.min(retryAfter, 2 ** retryCount * 1000, 30000);

    await sleep(delay);
    return api(originalRequest);
};

const handleResponseError = async (error: AxiosError): Promise<unknown> => {
    // const originalRequest = error.config as ExtendedAxiosRequestConfig;
    // console.log('first', error)
    // console.log('first', originalRequest)
    // if (!originalRequest) {
    //     throw normalizeError(error);
    // }

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //     return handle401Error(originalRequest);
    // }

    // if (error.response?.status === 429) {
    //     return handleRateLimitError(originalRequest, error);
    // }

    // return Promise.reject(normalizeError(error));
    throw normalizeError(error);
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
        throw normalizeError(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    handleResponseError
);


export default api;