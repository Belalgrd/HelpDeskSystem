// src/validations/profile.schema.ts

import { z } from 'zod';
import { simpleNameSchema, urlSchema } from './common.schema';

// ==========================================
// UPDATE PROFILE SCHEMA
// ==========================================

export const updateProfileSchema = z.object({
    firstName: simpleNameSchema,
    lastName: simpleNameSchema,
    avatarUrl: urlSchema,
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// ==========================================
// USER PREFERENCES SCHEMA
// ==========================================

export const userPreferencesSchema = z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    ticketUpdates: z.boolean(),
    newTicketAssigned: z.boolean(),
    ticketResolved: z.boolean(),
    theme: z.enum(['light', 'dark', 'system']),
});

export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;