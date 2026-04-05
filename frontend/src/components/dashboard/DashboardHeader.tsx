import React from 'react';
import { Select } from '../common/Select';

const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
];

interface DashboardHeaderProps {
    userName?: string;
    period: string;
    onPeriodChange: (period: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    userName,
    period,
    onPeriodChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Welcome back, {userName || 'User'}! Here's what's happening.
                </p>
            </div>
            <Select
                value={period}
                onChange={(e) => onPeriodChange(e.target.value)}
                options={periodOptions}
                className="w-40"
            />
        </div>
    );
};