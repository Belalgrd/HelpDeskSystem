// src/api/axios.ts

import axios from 'axios';

export const API_URL: string = import.meta.env.VITE_API_URL || 'https://localhost:7001/api';

// Public paths that should NOT redirect to login on 401
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if we're on a public page
            const currentPath = window.location.pathname;
            const isPublicPage = PUBLIC_PATHS.some(path => currentPath.startsWith(path));

            // Only redirect to login if NOT on a public page
            if (!isPublicPage) {
                localStorage.removeItem('token');
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Helper function to download files
export const downloadFile = async (attachmentId: string, fileName: string): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/attachments/${attachmentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

// Type for auth header
type AuthHeader = { Authorization: string } | Record<string, never>;

// Helper function to get auth header
export const getAuthHeader = (): AuthHeader => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default api;