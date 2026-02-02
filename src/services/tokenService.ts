const TOKEN_KEYS = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
    USER: 'user',
} as const;

// In-memory tokens (more secure than only localStorage)
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Safe localStorage operations
const getFromStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        console.warn('localStorage not available');
        return null;
    }
};

const setToStorage = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch {
        console.warn('localStorage not available');
    }
};

const removeFromStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch {
        console.warn('localStorage not available');
    }
};

// Initialize from storage on module load
const initializeTokens = (): void => {
    accessToken = getFromStorage(TOKEN_KEYS.ACCESS);
    refreshToken = getFromStorage(TOKEN_KEYS.REFRESH);
};

// Getters
export const getAccessToken = (): string | null => accessToken;

export const getRefreshToken = (): string | null => refreshToken;

// Setters
export const setTokens = (newAccessToken: string, newRefreshToken: string): void => {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;
    setToStorage(TOKEN_KEYS.ACCESS, newAccessToken);
    setToStorage(TOKEN_KEYS.REFRESH, newRefreshToken);
};

export const setAccessToken = (newAccessToken: string): void => {
    accessToken = newAccessToken;
    setToStorage(TOKEN_KEYS.ACCESS, newAccessToken);
};

// Clear all tokens
export const clearTokens = (): void => {
    accessToken = null;
    refreshToken = null;
    removeFromStorage(TOKEN_KEYS.ACCESS);
    removeFromStorage(TOKEN_KEYS.REFRESH);
    removeFromStorage(TOKEN_KEYS.USER);
};

// User storage
export const getStoredUser = <T>(): T | null => {
    try {
        const user = getFromStorage(TOKEN_KEYS.USER);
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const setStoredUser = <T>(user: T): void => {
    setToStorage(TOKEN_KEYS.USER, JSON.stringify(user));
};

// Token validation
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Add 10 second buffer
        return payload.exp * 1000 < Date.now() + 10000;
    } catch {
        return true;
    }
};

// Initialize on module load
initializeTokens();