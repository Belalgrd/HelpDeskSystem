import api from './axios';
import type {
    ApiResponse
} from '../types/common.types';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../types/auth.types';

// New types for forgot password
interface ForgotPasswordRequest {
    email: string;
}

interface ForgotPasswordResponse {
    success: boolean;
    message: string;
    resetToken?: string;
    resetUrl?: string;
}

interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

interface ValidateResetTokenRequest {
    email: string;
    token: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data;
    },

    getAgents: async (): Promise<ApiResponse<User[]>> => {
        const response = await api.get<ApiResponse<User[]>>('/auth/agents');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/auth/profile', data);
        return response.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<boolean>> => {
        const response = await api.put<ApiResponse<boolean>>('/auth/change-password', data);
        return response.data;
    },

    // NEW: Forgot Password
    forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> => {
        const response = await api.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', data);
        return response.data;
    },

    // NEW: Reset Password
    resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>('/auth/reset-password', data);
        return response.data;
    },

    // NEW: Validate Reset Token
    validateResetToken: async (data: ValidateResetTokenRequest): Promise<ApiResponse<boolean>> => {
        const response = await api.post<ApiResponse<boolean>>('/auth/validate-reset-token', data);
        return response.data;
    },
};