// src/routes/AdminRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../constants/roles';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuthStore();

    // First check if authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Then check if user has admin role
    if (user?.role !== ROLES.ADMIN) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};