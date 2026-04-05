// src/pages/auth/Register.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { HiMail, HiLockClosed, HiTicket, HiUser, HiCheck } from 'react-icons/hi';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useRegister } from '../../hooks/useAuth';
import { departmentsApi } from '../../api/common.api';
import { RegisterRequest } from '../../types/auth.types';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
    const { mutate: registerUser, isPending } = useRegister();

    // Use PUBLIC endpoint that doesn't require authentication
    const { data: departmentsResponse, isLoading: isLoadingDepartments } = useQuery({
        queryKey: ['departments-public'],
        queryFn: () => departmentsApi.getPublic(),
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    const departments = departmentsResponse?.data || [];

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        const registerData: RegisterRequest = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            departmentId: data.departmentId || undefined,
        };
        registerUser(registerData);
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
                    <p className="text-primary-100 mt-2">Create your account</p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                placeholder="John"
                                leftIcon={<HiUser className="w-5 h-5" />}
                                error={errors.firstName?.message}
                                {...register('firstName')}
                            />
                            <Input
                                label="Last Name"
                                placeholder="Doe"
                                error={errors.lastName?.message}
                                {...register('lastName')}
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            leftIcon={<HiMail className="w-5 h-5" />}
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Select
                            label="Department (Optional)"
                            placeholder={isLoadingDepartments ? "Loading departments..." : "Select your department"}
                            options={departments.map((d) => ({ value: d.id, label: d.name }))}
                            error={errors.departmentId?.message}
                            disabled={isLoadingDepartments}
                            {...register('departmentId')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a strong password"
                            leftIcon={<HiLockClosed className="w-5 h-5" />}
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            leftIcon={<HiLockClosed className="w-5 h-5" />}
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        {/* Password Requirements - FIXED with icons instead of bullet characters */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password must contain:
                            </p>
                            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <HiCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span>At least 8 characters</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <HiCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span>At least one uppercase letter</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <HiCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span>At least one lowercase letter</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <HiCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span>At least one number</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1 text-primary-600 rounded focus:ring-primary-500"
                                required
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary-600 hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </div>

                        <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
                            Create Account
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};