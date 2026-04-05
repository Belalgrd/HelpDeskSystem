import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    gradient: string;
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    change,
    changeType = 'neutral',
    gradient,
    className = '',
}) => {
    const changeColors = {
        positive: 'text-green-600 dark:text-green-400',
        negative: 'text-red-600 dark:text-red-400',
        neutral: 'text-gray-500 dark:text-gray-400',
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${className}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <div className="flex items-baseline mt-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </p>
                        {change && (
                            <span className={`ml-2 text-sm font-medium ${changeColors[changeType]}`}>
                                {change}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};