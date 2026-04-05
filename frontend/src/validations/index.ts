// src/validations/index.ts

// ==========================================
// COMMON SCHEMAS
// ==========================================
export {
    emailSchema,
    passwordSchema,
    simplePasswordSchema,
    nameSchema,
    simpleNameSchema,
    uuidSchema,
    optionalUuidSchema,
    urlSchema,
    dateStringSchema,
    futureDateSchema,
    ticketTitleSchema,
    ticketDescriptionSchema,
    ticketPrioritySchema,
    ticketStatusSchema,
    commentContentSchema,
    requiredSelectSchema,
    maxLengthSchema,
} from './common.schema';

// ==========================================
// AUTH SCHEMAS
// ==========================================
export {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './auth.schema';

export type {
    LoginFormData,
    RegisterFormData,
    ChangePasswordFormData,
    ForgotPasswordFormData,
    ResetPasswordFormData,
} from './auth.schema';

// ==========================================
// TICKET SCHEMAS
// ==========================================
export {
    createTicketSchema,
    updateTicketSchema,
    createCommentSchema,
    updateCommentSchema,
    ticketFilterSchema,
    assignTicketSchema,
} from './ticket.schema';

export type {
    CreateTicketFormData,
    UpdateTicketFormData,
    CreateCommentFormData,
    UpdateCommentFormData,
    TicketFilterFormData,
    AssignTicketFormData,
} from './ticket.schema';

// ==========================================
// PROFILE SCHEMAS
// ==========================================
export {
    updateProfileSchema,
    userPreferencesSchema,
} from './profile.schema';

export type {
    UpdateProfileFormData,
    UserPreferencesFormData,
} from './profile.schema';

// ==========================================
// USER SCHEMAS
// ==========================================
export {
    createUserSchema,
    updateUserSchema,
} from './user.schema';

export type {
    CreateUserFormData,
    UpdateUserFormData,
} from './user.schema';