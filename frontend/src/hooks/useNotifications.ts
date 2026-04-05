import { useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { signalRService } from '../services/signalR.service';

export const useNotifications = () => {
    const { isAuthenticated } = useAuthStore();
    const { fetchNotifications, isInitialized, reset } = useNotificationStore();
    const mountedRef = useRef(false);

    useEffect(() => {
        // Skip first mount in StrictMode (double render)
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }

        if (isAuthenticated && !isInitialized) {
            // Fetch initial notifications
            fetchNotifications();

            // Request browser notification permission
            signalRService.requestNotificationPermission();

            // Start SignalR connection with delay
            const timer = setTimeout(() => {
                signalRService.startConnection();
            }, 500);

            return () => {
                clearTimeout(timer);
            };
        }

        if (!isAuthenticated) {
            reset();
            signalRService.stopConnection();
        }
    }, [isAuthenticated, isInitialized, fetchNotifications, reset]);

    // Handle initial mount
    useEffect(() => {
        if (isAuthenticated && !isInitialized) {
            fetchNotifications();

            signalRService.requestNotificationPermission();

            const timer = setTimeout(() => {
                signalRService.startConnection();
            }, 1000);

            return () => {
                clearTimeout(timer);
                signalRService.stopConnection();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};

export const useRefreshNotifications = () => {
    const { fetchNotifications } = useNotificationStore();
    return fetchNotifications;
};