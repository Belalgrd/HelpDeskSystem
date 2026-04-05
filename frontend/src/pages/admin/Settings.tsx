import React, { useState } from 'react';
import {
    HiUser,
    HiKey,
    HiBell,
    HiColorSwatch,
    HiShieldCheck,
    HiCheck,
    HiMoon,
    HiSun,
    HiDesktopComputer,
} from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useUpdateProfile, useChangePassword } from '../../hooks/useSettings';
import toast from 'react-hot-toast';

// Tab options
const TABS = [
    { id: 'profile', label: 'Profile', icon: HiUser },
    { id: 'password', label: 'Password', icon: HiKey },
    { id: 'notifications', label: 'Notifications', icon: HiBell },
    { id: 'appearance', label: 'Appearance', icon: HiColorSwatch },
];

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Manage your account and application settings
                </p>
            </div>

            {/* Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'password' && <PasswordSettings />}
                    {activeTab === 'notifications' && <NotificationSettings />}
                    {activeTab === 'appearance' && <AppearanceSettings />}
                </div>
            </div>
        </div>
    );
};

// ==================== PROFILE SETTINGS ====================
const ProfileSettings: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const updateProfileMutation = useUpdateProfile();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfileMutation.mutateAsync(formData);
            toast.success('Profile updated successfully!');
        } catch {
            toast.error('Failed to update profile');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your personal information
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Avatar Preview */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{user?.fullName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Role: <span className="capitalize">{user?.role}</span>
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                    <Input
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>

                <Input
                    label="Email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700"
                />

                {/* Account Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <HiShieldCheck className="w-4 h-4" />
                        Account Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Department:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                                {user?.departmentName || 'Not assigned'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Role:</span>
                            <span className="ml-2 text-gray-900 dark:text-white capitalize">{user?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={updateProfileMutation.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};

// ==================== PASSWORD SETTINGS ====================
const PasswordSettings: React.FC = () => {
    const changePasswordMutation = useChangePassword();
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setShowSuccessModal(true);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            toast.error('Failed to change password. Please check your current password.');
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your password to keep your account secure
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <Input
                        label="Current Password"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        error={errors.currentPassword}
                        required
                    />

                    <Input
                        label="New Password"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        error={errors.newPassword}
                        required
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={errors.confirmPassword}
                        required
                    />

                    {/* Password Requirements */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password Requirements:
                        </h4>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className={formData.newPassword.length >= 8 ? 'text-green-500' : ''}>
                                    {formData.newPassword.length >= 8 ? <HiCheck className="w-4 h-4" /> : '•'}
                                </span>
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-500' : ''}>
                                    {/[A-Z]/.test(formData.newPassword) ? <HiCheck className="w-4 h-4" /> : '•'}
                                </span>
                                One uppercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-500' : ''}>
                                    {/[a-z]/.test(formData.newPassword) ? <HiCheck className="w-4 h-4" /> : '•'}
                                </span>
                                One lowercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-500' : ''}>
                                    {/[0-9]/.test(formData.newPassword) ? <HiCheck className="w-4 h-4" /> : '•'}
                                </span>
                                One number
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" isLoading={changePasswordMutation.isPending}>
                            Update Password
                        </Button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Password Changed"
                size="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <HiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your password has been updated successfully.
                    </p>
                    <Button className="mt-6" onClick={() => setShowSuccessModal(false)}>
                        Done
                    </Button>
                </div>
            </Modal>
        </>
    );
};

// ==================== NOTIFICATION SETTINGS ====================
const NotificationSettings: React.FC = () => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        ticketUpdates: true,
        newTicketAssigned: true,
        ticketResolved: true,
    });

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
        toast.success('Notification preference updated');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Choose what notifications you want to receive
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* General Notifications */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">General</h3>
                    <div className="space-y-4">
                        <ToggleItem
                            label="Email Notifications"
                            description="Receive notifications via email"
                            checked={preferences.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                        <ToggleItem
                            label="Push Notifications"
                            description="Receive push notifications in browser"
                            checked={preferences.pushNotifications}
                            onChange={() => handleToggle('pushNotifications')}
                        />
                    </div>
                </div>

                {/* Ticket Notifications */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Ticket Notifications</h3>
                    <div className="space-y-4">
                        <ToggleItem
                            label="Ticket Updates"
                            description="Get notified when tickets you're following are updated"
                            checked={preferences.ticketUpdates}
                            onChange={() => handleToggle('ticketUpdates')}
                        />
                        <ToggleItem
                            label="New Ticket Assigned"
                            description="Get notified when a ticket is assigned to you"
                            checked={preferences.newTicketAssigned}
                            onChange={() => handleToggle('newTicketAssigned')}
                        />
                        <ToggleItem
                            label="Ticket Resolved"
                            description="Get notified when your tickets are resolved"
                            checked={preferences.ticketResolved}
                            onChange={() => handleToggle('ticketResolved')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== APPEARANCE SETTINGS ====================
const AppearanceSettings: React.FC = () => {
    const { darkMode, setDarkMode } = useUIStore();
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
        darkMode ? 'dark' : 'light'
    );

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);

        if (newTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
        } else {
            setDarkMode(newTheme === 'dark');
        }

        toast.success(`Theme changed to ${newTheme}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Customize how the application looks
                </p>
            </div>

            <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ThemeOption
                        icon={<HiSun className="w-6 h-6" />}
                        label="Light"
                        description="Light background"
                        selected={theme === 'light'}
                        onClick={() => handleThemeChange('light')}
                    />
                    <ThemeOption
                        icon={<HiMoon className="w-6 h-6" />}
                        label="Dark"
                        description="Dark background"
                        selected={theme === 'dark'}
                        onClick={() => handleThemeChange('dark')}
                    />
                    <ThemeOption
                        icon={<HiDesktopComputer className="w-6 h-6" />}
                        label="System"
                        description="Follow system"
                        selected={theme === 'system'}
                        onClick={() => handleThemeChange('system')}
                    />
                </div>

                {/* Improved Preview */}
                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
                    <div className="rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg">
                        {/* Preview Container */}
                        <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            {/* Preview Header */}
                            <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-primary-600' : 'bg-primary-500'
                                        }`} />
                                    <div className={`h-3 w-20 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                                        }`} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                        }`} />
                                </div>
                            </div>

                            {/* Preview Body */}
                            <div className="flex">
                                {/* Sidebar */}
                                <div className={`w-16 p-2 border-r ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700'
                                        : 'bg-white border-gray-200'
                                    }`}>
                                    <div className="space-y-2">
                                        <div className={`w-full h-8 rounded-lg ${theme === 'dark' ? 'bg-primary-600/30' : 'bg-primary-100'
                                            }`} />
                                        <div className={`w-full h-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                            }`} />
                                        <div className={`w-full h-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                            }`} />
                                        <div className={`w-full h-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                            }`} />
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 p-4">
                                    {/* Page Title */}
                                    <div className={`h-4 w-32 rounded mb-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'
                                        }`} />

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className={`h-12 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                            } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                            }`} />
                                        <div className={`h-12 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                            } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                            }`} />
                                        <div className={`h-12 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                            } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                            }`} />
                                    </div>

                                    {/* Content Card */}
                                    <div className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                        } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                                                }`} />
                                            <div className={`h-2 w-24 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                                                }`} />
                                        </div>
                                        <div className={`h-2 w-full rounded mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                            }`} />
                                        <div className={`h-2 w-3/4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                            }`} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Theme Label */}
                        <div className={`px-4 py-2 text-center text-xs font-medium ${theme === 'dark'
                                ? 'bg-gray-800 text-gray-400 border-t border-gray-700'
                                : 'bg-gray-100 text-gray-500 border-t border-gray-200'
                            }`}>
                            {theme === 'light' && '☀️ Light Mode'}
                            {theme === 'dark' && '🌙 Dark Mode'}
                            {theme === 'system' && '💻 System Preference'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== HELPER COMPONENTS ====================
interface ToggleItemProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, description, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
};

interface ThemeOptionProps {
    icon: React.ReactNode;
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ icon, label, description, selected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            <div className={`mb-2 ${selected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>
                {icon}
            </div>
            <p className={`font-medium ${selected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            {selected && (
                <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                        <HiCheck className="w-3 h-3" />
                        Selected
                    </span>
                </div>
            )}
        </button>
    );
};