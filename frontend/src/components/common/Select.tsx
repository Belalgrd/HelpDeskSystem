// src/components/common/Select.tsx

import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className, disabled, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                        'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                        'disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed',
                        'transition-colors duration-200',
                        error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                        className
                    )}
                    defaultValue=""
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';