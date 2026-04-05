import api from './axios';
import type { ApiResponse, PaginatedList } from '../types/common.types';
import type { UserListItem, CreateUserRequest, UpdateUserRequest } from '../types/auth.types';

export interface UserFilters {
    search?: string;
    role?: string;
    departmentId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
}

export const usersApi = {
    getAll: async (filters?: UserFilters): Promise<ApiResponse<PaginatedList<UserListItem>>> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.departmentId) params.append('departmentId', filters.departmentId);
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));

        const response = await api.get<ApiResponse<PaginatedList<UserListItem>>>(`/users?${params.toString()}`);
        return response.data;
    },

    getById: async (id: string): Promise<ApiResponse<UserListItem>> => {
        const response = await api.get<ApiResponse<UserListItem>>(`/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserRequest): Promise<ApiResponse<UserListItem>> => {
        const response = await api.post<ApiResponse<UserListItem>>('/users', data);
        return response.data;
    },

    update: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<UserListItem>> => {
        const response = await api.put<ApiResponse<UserListItem>>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/users/${id}`);
        return response.data;
    },

    toggleStatus: async (id: string): Promise<ApiResponse<UserListItem>> => {
        const response = await api.patch<ApiResponse<UserListItem>>(`/users/${id}/toggle-status`);
        return response.data;
    },

    resetPassword: async (id: string, newPassword: string): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>(`/users/${id}/reset-password`, { newPassword });
        return response.data;
    },
};