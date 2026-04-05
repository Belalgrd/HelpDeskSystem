// src/types/auth.types.ts

// ==========================================
// USER TYPES
// ==========================================

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
    departmentId?: string;
    departmentName?: string;
}

export interface UserListItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
    departmentId?: string;
    departmentName?: string;
    isActive: boolean;
    createdAt: string;
}

// ==========================================
// AUTH REQUEST/RESPONSE TYPES
// ==========================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    departmentId?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    expiration: string;
    user: User;
}

// ==========================================
// USER MANAGEMENT TYPES
// ==========================================

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    departmentId?: string;
}

export interface UpdateUserRequest {
    firstName: string;
    lastName: string;
    role: string;
    departmentId?: string;
    isActive: boolean;
}

// ==========================================
// PROFILE & SETTINGS TYPES
// ==========================================

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    ticketUpdates: boolean;
    newTicketAssigned: boolean;
    ticketResolved: boolean;
    theme: 'light' | 'dark' | 'system';
}