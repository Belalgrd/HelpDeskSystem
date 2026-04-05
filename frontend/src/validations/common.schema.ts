// src/validations/common.schema.ts

import { z } from 'zod';

// ==========================================
// COMMON VALIDATION RULES
// ==========================================

// Email validation
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address');

// Password validation with requirements
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

// Simple password (for login - less strict)
export const simplePasswordSchema = z
    .string()
    .min(6, 'Password must be at least 6 characters');

// Name validation
export const nameSchema = z
    .string()
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Only letters, spaces, hyphens and apostrophes allowed');

// Simple name (allows more characters)
export const simpleNameSchema = z
    .string()
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be less than 50 characters');

// UUID validation
export const uuidSchema = z
    .string()
    .min(1, 'This field is required')
    .uuid('Invalid ID format');

// Optional UUID
export const optionalUuidSchema = z
    .string()
    .uuid('Invalid ID format')
    .optional()
    .or(z.literal(''));

// URL validation
export const urlSchema = z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal(''));

// Date validation (string format)
export const dateStringSchema = z
    .string()
    .optional()
    .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Please enter a valid date'
    );

// Future date validation
export const futureDateSchema = z
    .string()
    .optional()
    .refine(
        (val) => {
            if (!val) return true;
            const date = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
        },
        'Date must be today or in the future'
    );

// ==========================================
// TICKET-SPECIFIC RULES
// ==========================================

export const ticketTitleSchema = z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters');

export const ticketDescriptionSchema = z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(4000, 'Description must be less than 4000 characters');

// Fixed for Zod v4 - use 'message' instead of 'errorMap'
export const ticketPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical'], {
    message: 'Please select a valid priority',
});

// Fixed for Zod v4 - use 'message' instead of 'errorMap'
export const ticketStatusSchema = z.enum(
    ['Open', 'InProgress', 'Pending', 'Resolved', 'Closed', 'Cancelled'],
    {
        message: 'Please select a valid status',
    }
);

// ==========================================
// COMMENT RULES
// ==========================================

export const commentContentSchema = z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters');

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Create a required select schema
export const requiredSelectSchema = (fieldName: string = 'option') =>
    z.string().min(1, `Please select a ${fieldName}`);

// Create a max length schema
export const maxLengthSchema = (max: number, fieldName: string = 'Field') =>
    z.string().max(max, `${fieldName} must be less than ${max} characters`);