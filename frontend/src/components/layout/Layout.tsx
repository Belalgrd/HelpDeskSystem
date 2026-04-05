import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export const Layout: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const { sidebarOpen } = useUIStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <Header />
            <main
                className={cn(
                    'pt-16 min-h-screen transition-all duration-300',
                    sidebarOpen ? 'ml-64' : 'ml-20'
                )}
            >
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};