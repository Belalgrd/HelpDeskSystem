// src/validations/user.schema.ts

import { z } from 'zod';
import {
    emailSchema,
    passwordSchema,
    simpleNameSchema,
    requiredSelectSchema,
} from './common.schema';

// ==========================================
// CREATE USER SCHEMA (Admin)
// ==========================================

export const createUserSchema = z.object({
    firstName: simpleNameSchema,
    lastName: simpleNameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: requiredSelectSchema('role'),
    departmentId: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// ==========================================
// UPDATE USER SCHEMA (Admin)
// ==========================================

export const updateUserSchema = z.object({
    firstName: simpleNameSchema,
    lastName: simpleNameSchema,
    role: requiredSelectSchema('role'),
    departmentId: z.string().optional(),
    isActive: z.boolean(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;