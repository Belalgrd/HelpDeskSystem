// src/routes/PublicRoute.tsx

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loading } from '../components/common/Loading';

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Small delay to allow store to hydrate from localStorage
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Show loading while checking authentication status
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loading size="lg" />
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        // Redirect to the page they came from, or default to dashboard
        const from = (location.state as { from?: Location })?.from?.pathname || '/';
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
};