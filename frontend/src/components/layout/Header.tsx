import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiMenu,
    HiSearch,
    HiBell,
    HiPlus,
    HiSun,
    HiMoon,
    HiLogout,
    HiUser,
    HiX,
} from 'react-icons/hi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '../../utils/helpers';
import { Avatar } from '../common/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useLogout } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/helpers';
import type { Notification } from '../../types/notification.types';

export const Header: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
    const {
        notifications,
        unreadCount,
        isOpen,
        isLoading,
        toggleOpen,
        setOpen,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
    } = useNotificationStore();
    const logout = useLogout();

    // Search handler - navigates to tickets page with search query
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/tickets?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm(''); // Clear search after navigating
        }
    }, [searchTerm, navigate]);

    // Handle Enter key press
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim()) {
                navigate(`/tickets?search=${encodeURIComponent(searchTerm.trim())}`);
                setSearchTerm('');
            }
        }
    }, [searchTerm, navigate]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'warning':
                return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'error':
                return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        if (notification.ticketId) {
            setOpen(false);
            navigate(`/tickets/${notification.ticketId}`);
        }
    };

    return (
        <header
            className={cn(
                'fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300',
                sidebarOpen ? 'left-64' : 'left-20'
            )}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-8">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <HiMenu className="w-6 h-6" />
                    </button>

                    {/* Search - Now functional */}
                    <form onSubmit={handleSearch} className="hidden md:block relative">
                        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <HiX className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
                    </button>

                    {/* Notifications Dropdown */}
                    <div className="relative">
                        <button
                            onClick={toggleOpen}
                            className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Notifications"
                        >
                            <HiBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Panel */}
                        <Transition
                            show={isOpen}
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-150"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Notifications
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                        >
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {isLoading ? (
                                        <div className="px-4 py-8 text-center">
                                            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <HiBell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No notifications yet
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={cn(
                                                        'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group',
                                                        !notification.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                                                    )}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div
                                                            className={cn(
                                                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                                                getNotificationIcon(notification.typeCategory)
                                                            )}
                                                        >
                                                            <HiBell className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                {formatRelativeTime(notification.createdAt)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeNotification(notification.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <HiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <button
                                            onClick={clearAll}
                                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                                        >
                                            Clear all notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Transition>
                    </div>

                    {/* New Ticket Button */}
                    <Link
                        to="/tickets/create"
                        className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">New Ticket</span>
                    </Link>

                    {/* User Menu */}
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Avatar src={user?.avatarUrl} name={user?.fullName || 'User'} size="sm" />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                            </div>
                        </Menu.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700">
                                <div className="p-2">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/profile"
                                                className={cn(
                                                    'flex items-center px-4 py-2 text-sm rounded-lg',
                                                    active
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                )}
                                            >
                                                <HiUser className="w-4 h-4 mr-3" />
                                                Profile
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={logout}
                                                className={cn(
                                                    'flex items-center w-full px-4 py-2 text-sm rounded-lg',
                                                    active
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                )}
                                            >
                                                <HiLogout className="w-4 h-4 mr-3" />
                                                Logout
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
};