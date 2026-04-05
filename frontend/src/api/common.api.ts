// src/api/common.api.ts

import api from './axios';
import type {
    ApiResponse,
    Department,
    Category,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    CreateCategoryRequest,
    UpdateCategoryRequest
} from '../types/common.types';

// Departments API
export const departmentsApi = {
    // Public endpoint - no auth required (for registration)
    getPublic: async (): Promise<ApiResponse<Department[]>> => {
        const response = await api.get<ApiResponse<Department[]>>('/departments/public');
        return response.data;
    },

    // Protected endpoint - requires auth
    getAll: async (): Promise<ApiResponse<Department[]>> => {
        const response = await api.get<ApiResponse<Department[]>>('/departments');
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<Department>> => {
        const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
        return response.data;
    },

    create: async (data: CreateDepartmentRequest): Promise<ApiResponse<Department>> => {
        const response = await api.post<ApiResponse<Department>>('/departments', data);
        return response.data;
    },

    update: async (id: string, data: UpdateDepartmentRequest): Promise<ApiResponse<Department>> => {
        const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/departments/${id}`);
        return response.data;
    },
};

// Categories API
export const categoriesApi = {
    getAll: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<Category>> => {
        const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
        return response.data;
    },

    create: async (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => {
        const response = await api.post<ApiResponse<Category>>('/categories', data);
        return response.data;
    },

    update: async (id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => {
        const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/categories/${id}`);
        return response.data;
    },
};