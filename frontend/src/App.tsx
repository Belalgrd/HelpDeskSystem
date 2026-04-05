import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Layout
import { Layout } from './components/layout/Layout';

// ✅ NEW: Landing Page
import { LandingPage } from './pages/landing/LandingPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Main Pages
import { Dashboard } from './pages/dashboard/Dashboard';

// Profile Page
import { Profile } from './pages/profile';

// Ticket Pages
import { TicketList } from './pages/tickets/TicketList';
import { TicketDetail } from './pages/tickets/TicketDetail';
import { CreateTicket } from './pages/tickets/CreateTicket';
import { EditTicket } from './pages/tickets/EditTicket';

// Admin Pages
import { UserList } from './pages/admin/UserList';
import { DepartmentList } from './pages/admin/DepartmentList';
import { CategoryList } from './pages/admin/CategoryList';
import { Reports } from './pages/admin/Reports';
import { Settings } from './pages/admin/Settings';

// Error Pages
import { NotFound } from './pages/errors/NotFound';
import { Unauthorized } from './pages/errors/Unauthorized';

// Route Guards
import { PublicRoute, AdminRoute, RoleBasedRoute } from './routes';

// Stores & Hooks
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { useNotifications } from './hooks/useNotifications';

// Common Components
import { Loading } from './components/common/Loading';

// Constants
import { ROLES } from './constants/roles';

// React Query Configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

// Notification Initializer Component
const NotificationInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useNotifications();
    return <>{children}</>;
};

// ✅ NEW: Smart Root Handler
// - Not authenticated + "/" → Landing Page
// - Not authenticated + "/tickets" etc → Redirect to /login
// - Authenticated + any → Layout with nested routes
const RootHandler: React.FC = () => {
    const { isAuthenticated, token } = useAuthStore();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
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

    // Authenticated → Show Layout with nested routes
    if (isAuthenticated && token) {
        return <Layout />;
    }

    // Not authenticated + exact root "/" → Show Landing Page
    if (location.pathname === '/') {
        return <LandingPage />;
    }

    // Not authenticated + any other path → Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
    const { darkMode } = useUIStore();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <NotificationInitializer>
                    <Routes>
                        {/* ==================== */}
                        {/* PUBLIC ROUTES */}
                        {/* ==================== */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <PublicRoute>
                                    <ForgotPassword />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                <PublicRoute>
                                    <ResetPassword />
                                </PublicRoute>
                            }
                        />

                        {/* ==================== */}
                        {/* ERROR PAGES (Accessible to all) */}
                        {/* ==================== */}
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/404" element={<NotFound />} />

                        {/* ==================== */}
                        {/* ROOT + PROTECTED ROUTES */}
                        {/* ==================== */}
                        <Route path="/" element={<RootHandler />}>
                            {/* Dashboard - All authenticated users */}
                            <Route index element={<Dashboard />} />

                            {/* ==================== */}
                            {/* PROFILE - All authenticated users */}
                            {/* ==================== */}
                            <Route path="profile" element={<Profile />} />

                            {/* ==================== */}
                            {/* TICKET ROUTES - All authenticated users */}
                            {/* ==================== */}
                            <Route path="tickets" element={<TicketList />} />
                            <Route path="tickets/create" element={<CreateTicket />} />
                            <Route path="tickets/:id" element={<TicketDetail />} />
                            <Route path="tickets/:id/edit" element={<EditTicket />} />

                            {/* ==================== */}
                            {/* ADMIN ROUTES - Admin only */}
                            {/* ==================== */}
                            <Route
                                path="admin/users"
                                element={
                                    <AdminRoute>
                                        <UserList />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="admin/departments"
                                element={
                                    <AdminRoute>
                                        <DepartmentList />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="admin/categories"
                                element={
                                    <AdminRoute>
                                        <CategoryList />
                                    </AdminRoute>
                                }
                            />

                            {/* ==================== */}
                            {/* REPORTS - Admin & Agent */}
                            {/* ==================== */}
                            <Route
                                path="reports"
                                element={
                                    <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.AGENT]}>
                                        <Reports />
                                    </RoleBasedRoute>
                                }
                            />

                            {/* ==================== */}
                            {/* SETTINGS - Admin only */}
                            {/* ==================== */}
                            <Route
                                path="settings"
                                element={
                                    <AdminRoute>
                                        <Settings />
                                    </AdminRoute>
                                }
                            />

                            {/* ==================== */}
                            {/* CATCH ALL - Inside Layout */}
                            {/* ==================== */}
                            <Route path="*" element={<NotFound />} />
                        </Route>

                        {/* ==================== */}
                        {/* GLOBAL CATCH ALL */}
                        {/* ==================== */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>

                    {/* Toast Notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: darkMode ? '#1f2937' : '#fff',
                                color: darkMode ? '#fff' : '#1f2937',
                                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </NotificationInitializer>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;