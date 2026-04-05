import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types/auth.types';

export const useUpdateProfile = () => {
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                updateUser(response.data);
            }
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    });
};