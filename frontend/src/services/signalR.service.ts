import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { RealTimeNotification } from '../types/notification.types';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private isConnecting: boolean = false;

    private getHubUrl(): string {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5179/api';
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}/hubs/notifications`;
    }

    async startConnection(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('SignalR connection already in progress');
            return;
        }

        const token = useAuthStore.getState().token;
        if (!token) {
            console.log('No token available for SignalR connection');
            return;
        }

        this.isConnecting = true;

        try {
            const hubUrl = this.getHubUrl();
            console.log('SignalR connecting to:', hubUrl);

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => token,
                })
                .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            this.setupEventHandlers();

            await this.connection.start();
            console.log('SignalR Connected!');

        } catch (error) {
            console.error('SignalR Connection Error:', error);
        } finally {
            this.isConnecting = false;
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        this.connection.on('ReceiveNotification', (notification: RealTimeNotification) => {
            console.log('Received notification:', notification);

            const store = useNotificationStore.getState();
            store.addNotification({
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.typeCategory,  // Changed from typeCategory to type
                read: false,                       // Added read property
                createdAt: notification.createdAt,
                ticketId: notification.ticketId,
            });

            this.showBrowserNotification(notification);
        });

        this.connection.on('UnreadCountUpdated', (count: number) => {
            console.log('Unread count updated:', count);
            useNotificationStore.getState().setUnreadCount(count);
        });

        this.connection.onreconnecting((error) => {
            console.log('SignalR Reconnecting...', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR Reconnected:', connectionId);
        });

        this.connection.onclose((error) => {
            console.log('SignalR Connection Closed:', error);
        });
    }

    private showBrowserNotification(notification: RealTimeNotification): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id,
            });
        }
    }

    async requestNotificationPermission(): Promise<void> {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    async stopConnection(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log('SignalR Disconnected');
            } catch (error) {
                console.error('Error stopping SignalR connection:', error);
            }
            this.connection = null;
        }
    }

    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}

export const signalRService = new SignalRService();