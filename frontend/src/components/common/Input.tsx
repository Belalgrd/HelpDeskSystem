import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 dark:text-gray-500">
                                {leftIcon}
                            </span>
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full px-3 py-2 text-sm rounded-lg border transition-all duration-150',
                            'bg-white dark:bg-gray-700',
                            'border-gray-300 dark:border-gray-600',
                            'text-gray-900 dark:text-white',
                            'placeholder-gray-400 dark:placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <span className="text-gray-400 dark:text-gray-500">
                                {rightIcon}
                            </span>
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';