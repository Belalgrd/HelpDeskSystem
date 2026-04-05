// src/constants/roles.ts

export const ROLES = {
    ADMIN: 'Admin',
    AGENT: 'Agent',
    USER: 'User',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<string, number> = {
    [ROLES.ADMIN]: 3,
    [ROLES.AGENT]: 2,
    [ROLES.USER]: 1,
};

// Helper function to check if user has required role
export const hasRole = (userRole: string | undefined, requiredRoles: string[]): boolean => {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
};

// Helper function to check if user has minimum role level
export const hasMinimumRole = (userRole: string | undefined, minimumRole: string): boolean => {
    if (!userRole) return false;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
    return userLevel >= requiredLevel;
};

// Route permissions configuration
export const ROUTE_PERMISSIONS = {
    // Admin only routes
    '/admin/users': [ROLES.ADMIN],
    '/admin/departments': [ROLES.ADMIN],
    '/admin/categories': [ROLES.ADMIN],
    '/reports': [ROLES.ADMIN, ROLES.AGENT],
    '/settings': [ROLES.ADMIN],

    // Agent and above
    // Add more route permissions as needed
} as const;