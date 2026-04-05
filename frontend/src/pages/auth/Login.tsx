// src/pages/auth/Login.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HiMail, HiLockClosed, HiTicket } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useLogin } from '../../hooks/useAuth';
import { LoginRequest } from '../../types/auth.types';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login: React.FC = () => {
    const { mutate: login, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginRequest) => {
        login(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <HiTicket className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">HelpDesk</h1>
                    <p className="text-primary-100 mt-2">Sign in to your account</p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            leftIcon={<HiMail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            leftIcon={<HiLockClosed className="w-5 h-5" />}
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
                            Sign In
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};