// src/pages/profile/ProfileInfo.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiUser, HiMail, HiOfficeBuilding, HiCamera, HiCheck } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/useProfile';
import { updateProfileSchema, type UpdateProfileFormData } from '../../validations';

export const ProfileInfo: React.FC = () => {
    const { user } = useAuthStore();
    const { mutate: updateProfile, isPending } = useUpdateProfile();
    const [isEditing, setIsEditing] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            avatarUrl: user?.avatarUrl || '',
        },
    });

    const onSubmit = (data: UpdateProfileFormData) => {
        updateProfile(data, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleCancel = () => {
        reset({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            avatarUrl: user?.avatarUrl || '',
        });
        setIsEditing(false);
    };

    // Build role and department string properly
    const getRoleDisplay = () => {
        const parts: string[] = [];
        if (user?.role) parts.push(user.role);
        if (user?.departmentName) parts.push(user.departmentName);
        return parts.join(' - ');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Profile Information
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Update your personal information
                        </p>
                    </div>
                    {!isEditing && (
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                        <Avatar
                            src={user?.avatarUrl}
                            name={user?.fullName || 'User'}
                            size="xl"
                        />
                        {isEditing && (
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                            >
                                <HiCamera className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {user?.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {getRoleDisplay()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        leftIcon={<HiUser className="w-5 h-5" />}
                        disabled={!isEditing}
                        error={errors.firstName?.message}
                        {...register('firstName')}
                    />

                    {/* Last Name */}
                    <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        leftIcon={<HiUser className="w-5 h-5" />}
                        disabled={!isEditing}
                        error={errors.lastName?.message}
                        {...register('lastName')}
                    />

                    {/* Email (Read-only) */}
                    <Input
                        label="Email Address"
                        type="email"
                        value={user?.email || ''}
                        leftIcon={<HiMail className="w-5 h-5" />}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700/50"
                    />

                    {/* Department (Read-only) */}
                    <Input
                        label="Department"
                        value={user?.departmentName || 'Not assigned'}
                        leftIcon={<HiOfficeBuilding className="w-5 h-5" />}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700/50"
                    />
                </div>

                {/* Avatar URL (when editing) */}
                {isEditing && (
                    <div className="mt-6">
                        <Input
                            label="Avatar URL"
                            placeholder="https://example.com/avatar.jpg"
                            error={errors.avatarUrl?.message}
                            {...register('avatarUrl')}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Enter a URL for your profile picture
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isPending}
                            disabled={!isDirty}
                            leftIcon={<HiCheck className="w-4 h-4" />}
                        >
                            Save Changes
                        </Button>
                    </div>
                )}
            </form>

            {/* Account Info */}
            {!isEditing && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                            Role: <span className="font-medium text-gray-900 dark:text-white">{user?.role}</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            User ID: <span className="font-mono text-xs">{user?.id?.slice(0, 8)}...</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};