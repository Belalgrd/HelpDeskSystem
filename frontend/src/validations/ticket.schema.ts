// src/validations/ticket.schema.ts

import { z } from 'zod';
import {
    ticketTitleSchema,
    ticketDescriptionSchema,
    ticketPrioritySchema,
    requiredSelectSchema,
    futureDateSchema,
    commentContentSchema,
} from './common.schema';

// ==========================================
// CREATE TICKET SCHEMA
// ==========================================

export const createTicketSchema = z.object({
    title: ticketTitleSchema,
    description: ticketDescriptionSchema,
    priority: ticketPrioritySchema,
    categoryId: requiredSelectSchema('category'),
    departmentId: requiredSelectSchema('department'),
    dueDate: futureDateSchema,
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

// ==========================================
// UPDATE TICKET SCHEMA
// ==========================================

export const updateTicketSchema = z.object({
    title: ticketTitleSchema,
    description: ticketDescriptionSchema,
    priority: ticketPrioritySchema,
    categoryId: requiredSelectSchema('category'),
    departmentId: requiredSelectSchema('department'),
    dueDate: z.string().optional(),
});

export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;

// ==========================================
// COMMENT SCHEMA
// ==========================================

export const createCommentSchema = z.object({
    content: commentContentSchema,
    isInternal: z.boolean().optional().default(false),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
    content: commentContentSchema,
});

export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;

// ==========================================
// TICKET FILTER SCHEMA
// ==========================================

export const ticketFilterSchema = z.object({
    searchTerm: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
    categoryId: z.string().optional(),
    departmentId: z.string().optional(),
    assigneeId: z.string().optional(),
    requesterId: z.string().optional(),
    sortBy: z.string().optional(),
    sortDescending: z.boolean().optional(),
});

export type TicketFilterFormData = z.infer<typeof ticketFilterSchema>;

// ==========================================
// ASSIGN TICKET SCHEMA
// ==========================================

export const assignTicketSchema = z.object({
    assigneeId: requiredSelectSchema('assignee'),
});

export type AssignTicketFormData = z.infer<typeof assignTicketSchema>;