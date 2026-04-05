// src/pages/profile/AccountSettings.tsx

import React from 'react';
import { HiBell, HiMoon, HiMail, HiTicket, HiCheckCircle } from 'react-icons/hi';
import { useUIStore } from '../../store/uiStore';

// ✅ MOVED OUTSIDE - ToggleSwitch Component
interface ToggleSwitchProps {
    enabled: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    enabled,
    onChange,
    label,
    description,
    icon
}) => (
    <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
            {icon && (
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {icon}
                </div>
            )}
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                </p>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

// ✅ Main Component
export const AccountSettings: React.FC = () => {
    const { darkMode, toggleDarkMode } = useUIStore();

    // Note: These would typically be stored in backend
    // For now, we'll use local state
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [ticketUpdates, setTicketUpdates] = React.useState(true);
    const [ticketResolved, setTicketResolved] = React.useState(true);

    return (
        <div className="space-y-6">
            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Appearance
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Customize how the application looks
                    </p>
                </div>
                <div className="px-6 divide-y divide-gray-200 dark:divide-gray-700">
                    <ToggleSwitch
                        enabled={darkMode}
                        onChange={toggleDarkMode}
                        label="Dark Mode"
                        description="Use dark theme for the application"
                        icon={<HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    />
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your notification preferences
                    </p>
                </div>
                <div className="px-6 divide-y divide-gray-200 dark:divide-gray-700">
                    <ToggleSwitch
                        enabled={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                        label="Email Notifications"
                        description="Receive notifications via email"
                        icon={<HiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    />
                    <ToggleSwitch
                        enabled={ticketUpdates}
                        onChange={() => setTicketUpdates(!ticketUpdates)}
                        label="Ticket Updates"
                        description="Get notified when your tickets are updated"
                        icon={<HiTicket className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    />
                    <ToggleSwitch
                        enabled={ticketResolved}
                        onChange={() => setTicketResolved(!ticketResolved)}
                        label="Ticket Resolved"
                        description="Get notified when your tickets are resolved"
                        icon={<HiCheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    />
                </div>
            </div>

            {/* Browser Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Browser Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Desktop notification settings
                    </p>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <HiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Push Notifications
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {Notification.permission === 'granted'
                                        ? 'Enabled'
                                        : Notification.permission === 'denied'
                                            ? 'Blocked by browser'
                                            : 'Not enabled'}
                                </p>
                            </div>
                        </div>
                        {Notification.permission === 'default' && (
                            <button
                                onClick={() => Notification.requestPermission()}
                                className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                            >
                                Enable
                            </button>
                        )}
                        {Notification.permission === 'granted' && (
                            <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50">
                <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50">
                    <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                        Danger Zone
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Irreversible actions
                    </p>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Delete Account
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => alert('This feature is not implemented yet')}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};