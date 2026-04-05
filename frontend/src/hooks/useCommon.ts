import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, categoriesApi } from '../api/common.api';
import type { CreateDepartmentRequest, UpdateDepartmentRequest, CreateCategoryRequest, UpdateCategoryRequest } from '../types/common.types';

// ==================== DEPARTMENTS ====================

export const useDepartments = () => {
    return useQuery({
        queryKey: ['departments'],
        queryFn: () => departmentsApi.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useDepartment = (id: string) => {
    return useQuery({
        queryKey: ['departments', id],
        queryFn: () => departmentsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateDepartment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDepartmentRequest) => departmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
            departmentsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => departmentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
        },
    });
};

// ==================== CATEGORIES ====================

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => categoriesApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
            categoriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};