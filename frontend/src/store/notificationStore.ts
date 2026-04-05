import { create } from 'zustand';
import { notificationsApi } from '../api/notifications.api';
import type { Notification } from '../types/notification.types';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isOpen: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    // UI Actions
    setOpen: (open: boolean) => void;
    toggleOpen: () => void;

    // Data Actions
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: {
        id: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        read: boolean;
        createdAt: string;
        ticketId?: string;
    }) => void;
    setUnreadCount: (count: number) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,
    isInitialized: false,

    setOpen: (open) => set({ isOpen: open }),

    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

    fetchNotifications: async () => {
        // Prevent multiple fetches
        if (get().isLoading) return;

        set({ isLoading: true });
        try {
            const response = await notificationsApi.getNotifications(20);
            if (response.success && response.data) {
                set({
                    notifications: response.data.recentNotifications.map(n => ({
                        ...n,
                        type: n.typeCategory,
                    })),
                    unreadCount: response.data.unreadCount,
                    isInitialized: true,
                });
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Still mark as initialized to prevent infinite retries
            set({ isInitialized: true });
        } finally {
            set({ isLoading: false });
        }
    },

    addNotification: (notification) =>
        set((state) => ({
            notifications: [
                {
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    typeCategory: notification.type,
                    isRead: notification.read,
                    createdAt: notification.createdAt,
                    ticketId: notification.ticketId,
                } as Notification,
                ...state.notifications,
            ],
            unreadCount: state.unreadCount + 1,
        })),

    setUnreadCount: (count) => set({ unreadCount: count }),

    markAsRead: async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            set((state) => {
                const notifications = state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const unreadCount = notifications.filter((n) => !n.isRead).length;
                return { notifications, unreadCount };
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationsApi.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },

    removeNotification: async (id) => {
        try {
            await notificationsApi.delete(id);
            set((state) => {
                const notifications = state.notifications.filter((n) => n.id !== id);
                const unreadCount = notifications.filter((n) => !n.isRead).length;
                return { notifications, unreadCount };
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    clearAll: async () => {
        try {
            await notificationsApi.clearAll();
            set({ notifications: [], unreadCount: 0 });
        } catch (error) {
            console.error('Failed to clear all notifications:', error);
        }
    },

    reset: () => set({
        notifications: [],
        unreadCount: 0,
        isOpen: false,
        isLoading: false,
        isInitialized: false,
    }),
}));