// src/pages/profile/ChangePassword.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiLockClosed, HiEye, HiEyeOff, HiShieldCheck } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useChangePassword } from '../../hooks/useProfile';
import { changePasswordSchema, type ChangePasswordFormData } from '../../validations';

export const ChangePassword: React.FC = () => {
    const { mutate: changePassword, isPending } = useChangePassword();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');

    const onSubmit = (data: ChangePasswordFormData) => {
        changePassword(
            {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            },
            {
                onSuccess: () => {
                    reset();
                },
            }
        );
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        let strength = 0;

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 1) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 2) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
        if (strength <= 3) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
        if (strength <= 4) return { strength: 4, label: 'Strong', color: 'bg-green-500' };
        return { strength: 5, label: 'Very Strong', color: 'bg-green-600' };
    };

    const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <HiShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Change Password
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Ensure your account is using a secure password
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Current Password */}
                <Input
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter your current password"
                    leftIcon={<HiLockClosed className="w-5 h-5" />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="focus:outline-none"
                        >
                            {showCurrentPassword ? (
                                <HiEyeOff className="w-5 h-5" />
                            ) : (
                                <HiEye className="w-5 h-5" />
                            )}
                        </button>
                    }
                    error={errors.currentPassword?.message}
                    {...register('currentPassword')}
                />

                {/* New Password */}
                <div>
                    <Input
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        leftIcon={<HiLockClosed className="w-5 h-5" />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="focus:outline-none"
                            >
                                {showNewPassword ? (
                                    <HiEyeOff className="w-5 h-5" />
                                ) : (
                                    <HiEye className="w-5 h-5" />
                                )}
                            </button>
                        }
                        error={errors.newPassword?.message}
                        {...register('newPassword')}
                    />

                    {/* Password Strength Indicator */}
                    {newPassword && passwordStrength && (
                        <div className="mt-2">
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                    />
                                </div>
                                <span
                                    className={`text-xs font-medium ${passwordStrength.strength <= 2
                                            ? 'text-red-500'
                                            : passwordStrength.strength <= 3
                                                ? 'text-yellow-500'
                                                : 'text-green-500'
                                        }`}
                                >
                                    {passwordStrength.label}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <Input
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    leftIcon={<HiLockClosed className="w-5 h-5" />}
                    rightIcon={
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="focus:outline-none"
                        >
                            {showConfirmPassword ? (
                                <HiEyeOff className="w-5 h-5" />
                            ) : (
                                <HiEye className="w-5 h-5" />
                            )}
                        </button>
                    }
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                {/* Password Requirements */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password Requirements:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <li className="flex items-center space-x-2">
                            <span className={newPassword && newPassword.length >= 8 ? 'text-green-500' : ''}>
                                {newPassword && newPassword.length >= 8 ? '✓' : '•'}
                            </span>
                            <span>At least 8 characters</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className={newPassword && /[A-Z]/.test(newPassword) ? 'text-green-500' : ''}>
                                {newPassword && /[A-Z]/.test(newPassword) ? '✓' : '•'}
                            </span>
                            <span>One uppercase letter</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className={newPassword && /[a-z]/.test(newPassword) ? 'text-green-500' : ''}>
                                {newPassword && /[a-z]/.test(newPassword) ? '✓' : '•'}
                            </span>
                            <span>One lowercase letter</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <span className={newPassword && /\d/.test(newPassword) ? 'text-green-500' : ''}>
                                {newPassword && /\d/.test(newPassword) ? '✓' : '•'}
                            </span>
                            <span>One number</span>
                        </li>
                    </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="submit"
                        isLoading={isPending}
                        leftIcon={<HiLockClosed className="w-4 h-4" />}
                    >
                        Update Password
                    </Button>
                </div>
            </form>
        </div>
    );
};