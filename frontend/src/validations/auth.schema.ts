// src/validations/auth.schema.ts

import { z } from 'zod';
import {
    emailSchema,
    passwordSchema,
    simplePasswordSchema,
    simpleNameSchema,
} from './common.schema';

// ==========================================
// LOGIN SCHEMA
// ==========================================

export const loginSchema = z.object({
    email: emailSchema,
    password: simplePasswordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ==========================================
// REGISTER SCHEMA
// ==========================================

export const registerSchema = z
    .object({
        firstName: simpleNameSchema,
        lastName: simpleNameSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        departmentId: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ==========================================
// CHANGE PASSWORD SCHEMA
// ==========================================

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword'],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ==========================================
// FORGOT PASSWORD SCHEMA
// ==========================================

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ==========================================
// RESET PASSWORD SCHEMA
// ==========================================

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        token: z.string().min(1, 'Reset token is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;