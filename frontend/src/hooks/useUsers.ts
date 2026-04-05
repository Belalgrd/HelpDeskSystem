import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UserFilters } from '../api/users.api';
import type { CreateUserRequest, UpdateUserRequest } from '../types/auth.types';

export const useUsers = (filters?: UserFilters) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => usersApi.getAll(filters),
        staleTime: 2 * 60 * 1000,
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            usersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersApi.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
            usersApi.resetPassword(id, newPassword),
    });
};