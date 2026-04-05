export type NotificationType =
    | 'TicketCreated'
    | 'TicketAssigned'
    | 'TicketUpdated'
    | 'TicketStatusChanged'
    | 'TicketCommented'
    | 'TicketResolved'
    | 'TicketClosed'
    | 'HighPriorityTicket'
    | 'TicketOverdue'
    | 'TicketMention';

export type NotificationCategory = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType | string;  // Backend notification type
    typeCategory: NotificationCategory;  // UI display category
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    ticketId?: string;
    ticketNumber?: string;
}

export interface NotificationSummary {
    totalCount: number;
    unreadCount: number;
    recentNotifications: Notification[];
}

export interface RealTimeNotification {
    id: string;
    title: string;
    message: string;
    type: string;
    typeCategory: NotificationCategory;
    createdAt: string;
    ticketId?: string;
    ticketNumber?: string;
}