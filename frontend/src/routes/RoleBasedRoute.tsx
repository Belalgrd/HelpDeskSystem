// src/routes/RoleBasedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasRole, hasMinimumRole } from '../constants/roles';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];      // Specific roles allowed
    minimumRole?: string;          // Minimum role level required
    redirectTo?: string;           // Custom redirect path
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
    children,
    allowedRoles,
    minimumRole,
    redirectTo = '/unauthorized',
}) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuthStore();

    // First check if authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    const userRole = user?.role;

    // If allowedRoles is specified, check if user's role is in the list
    if (allowedRoles && allowedRoles.length > 0) {
        if (!hasRole(userRole, allowedRoles)) {
            return <Navigate to={redirectTo} state={{ from: location }} replace />;
        }
    }

    // If minimumRole is specified, check if user meets minimum level
    if (minimumRole) {
        if (!hasMinimumRole(userRole, minimumRole)) {
            return <Navigate to={redirectTo} state={{ from: location }} replace />;
        }
    }

    return <>{children}</>;
};