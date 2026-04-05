import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy') {
    return format(new Date(date), formatStr);
}

export function formatDateTime(date: string | Date) {
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function getInitials(name: string): string {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        InProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        Pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        Resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status] || colors.Open;
}

export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        Low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[priority] || colors.Medium;
}

export function getStatusDotColor(status: string): string {
    const colors: Record<string, string> = {
        Open: 'bg-blue-500',
        InProgress: 'bg-yellow-500',
        Pending: 'bg-orange-500',
        Resolved: 'bg-green-500',
        Closed: 'bg-gray-500',
        Cancelled: 'bg-red-500',
    };
    return colors[status] || colors.Open;
}