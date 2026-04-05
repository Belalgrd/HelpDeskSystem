import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiLockClosed, HiTicket, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Validate token on mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token || !email) {
                setIsInvalidToken(true);
                setIsValidating(false);
                return;
            }

            try {
                const response = await authApi.validateResetToken({ email, token });
                if (!response.success) {
                    setIsInvalidToken(true);
                }
            } catch {
                setIsInvalidToken(true);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token, email]);

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token || !email) return;

        setIsLoading(true);

        try {
            const response = await authApi.resetPassword({
                email,
                token,
                newPassword: data.password,
            });

            if (response.success) {
                setIsSuccess(true);
                toast.success('Password reset successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error(response.message || 'Failed to reset password');
                setIsInvalidToken(true);
            }
        } catch {
            toast.error('Failed to reset password. Link may have expired.');
            setIsInvalidToken(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Loading State
    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <Loading size="lg" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid Token State
    if (isInvalidToken || !token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                            <HiTicket className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HelpDesk</h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiExclamationCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Invalid or Expired Link
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <div className="space-y-3">
                            <Link to="/forgot-password" className="block">
                                <Button className="w-full">Request New Link</Button>
                            </Link>
                            <Link to="/login" className="block">
                                <Button variant="secondary" className="w-full">Back to Login</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success State
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                            <HiTicket className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HelpDesk</h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Password Reset Successful!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                        <Link to="/login">
                            <Button className="w-full">Go to Sign In</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Form State
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <HiTicket className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">HelpDesk</h1>
                    <p className="text-primary-100 mt-2">Create new password</p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Reset your password
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Enter your new password below. Make sure it's strong and secure.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            leftIcon={<HiLockClosed className="w-5 h-5" />}
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm new password"
                            leftIcon={<HiLockClosed className="w-5 h-5" />}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        {/* Password Requirements */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password must contain:
                            </p>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li>• At least 8 characters</li>
                                <li>• At least one uppercase letter</li>
                                <li>• At least one lowercase letter</li>
                                <li>• At least one number</li>
                            </ul>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Reset Password
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};