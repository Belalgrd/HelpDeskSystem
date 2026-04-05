// src/pages/profile/Profile.tsx

import React, { useState } from 'react';
import { HiUser, HiLockClosed, HiCog, HiTicket } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { ProfileInfo } from './ProfileInfo';
import { ChangePassword } from './ChangePassword';
import { AccountSettings } from './AccountSettings';
import { useAuthStore } from '../../store/authStore';

type TabType = 'profile' | 'password' | 'settings';

interface Tab {
    id: TabType;
    label: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: <HiUser className="w-5 h-5" /> },
    { id: 'password', label: 'Password', icon: <HiLockClosed className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <HiCog className="w-5 h-5" /> },
];

export const Profile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const { user } = useAuthStore();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        My Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>
                <Link
                    to={`/tickets?requesterId=${user?.id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <HiTicket className="w-5 h-5" />
                    <span>My Tickets</span>
                </Link>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            )}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'profile' && <ProfileInfo />}
                {activeTab === 'password' && <ChangePassword />}
                {activeTab === 'settings' && <AccountSettings />}
            </div>
        </div>
    );
};