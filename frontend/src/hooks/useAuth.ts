import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.token);
                toast.success('Login successful!');
                navigate('/');
            } else {
                toast.error(response.message || 'Login failed');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Login failed');
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.token);
                toast.success('Registration successful!');
                navigate('/');
            } else {
                toast.error(response.message || 'Registration failed');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Registration failed');
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    return () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authApi.getCurrentUser(),
        enabled: !!localStorage.getItem('token'),
    });
};

export const useAgents = () => {
    return useQuery({
        queryKey: ['agents'],
        queryFn: () => authApi.getAgents(),
    });
};