// src/hooks/useProfile.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types/auth.types';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                // Update the user in Zustand store
                updateUser(response.data);
                // Invalidate any user-related queries
                queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                toast.success('Profile updated successfully!');
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update profile');
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Password changed successfully!');
            } else {
                toast.error(response.message || 'Failed to change password');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to change password. Please check your current password.');
        },
    });
};