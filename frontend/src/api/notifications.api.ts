import api from './axios';
import type { ApiResponse } from '../types/common.types';
import type { NotificationSummary } from '../types/notification.types';

export const notificationsApi = {
    // Get notification summary with recent notifications
    getNotifications: async (count: number = 20): Promise<ApiResponse<NotificationSummary>> => {
        const response = await api.get<ApiResponse<NotificationSummary>>(
            `/notifications?count=${count}`
        );
        return response.data;
    },

    // Get unread count only
    getUnreadCount: async (): Promise<ApiResponse<number>> => {
        const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
        return response.data;
    },

    // Mark single notification as read
    markAsRead: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.put<ApiResponse<null>>(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<ApiResponse<null>> => {
        const response = await api.put<ApiResponse<null>>('/notifications/read-all');
        return response.data;
    },

    // Delete single notification
    delete: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
        return response.data;
    },

    // Delete all notifications
    clearAll: async (): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>('/notifications/clear-all');
        return response.data;
    },
};