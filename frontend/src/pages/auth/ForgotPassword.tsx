import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiMail, HiTicket, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/auth.api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);

        try {
            const response = await authApi.forgotPassword({ email: data.email });

            if (response.success) {
                setIsSubmitted(true);
                toast.success('Password reset instructions sent!');

                // For development: log the reset URL if available
                if (response.data?.resetUrl) {
                    console.log('Reset URL (DEV):', response.data.resetUrl);
                }
            } else {
                toast.error(response.message || 'Failed to send reset email');
            }
        } catch {
            // Still show success to prevent email enumeration
            setIsSubmitted(true);
            toast.success('If your email is registered, you will receive reset instructions.');
        } finally {
            setIsLoading(false);
        }
    };

    // Success State
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                            <HiTicket className="w-8 h-8 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">HelpDesk</h1>
                    </div>

                    {/* Success Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Check your email
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We've sent password reset instructions to{' '}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {getValues('email')}
                            </span>
                        </p>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    try again
                                </button>
                            </p>

                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center text-primary-600 hover:text-primary-700 font-medium"
                            >
                                <HiArrowLeft className="w-4 h-4 mr-2" />
                                Back to Sign In
                            </Link>
                        </div>
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
                    <p className="text-primary-100 mt-2">Reset your password</p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Forgot your password?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            No worries! Enter your email address and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            leftIcon={<HiMail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Send Reset Instructions
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            <HiArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-primary-100 text-sm">
                        Need help? Contact your administrator or{' '}
                        <a href="mailto:support@helpdesk.com" className="text-white font-medium hover:underline">
                            support@helpdesk.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};