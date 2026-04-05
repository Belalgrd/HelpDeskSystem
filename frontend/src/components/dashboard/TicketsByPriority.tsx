import React from 'react';
import type { TicketsByPriority as TicketsByPriorityType } from '../../types/common.types';

interface TicketsByPriorityProps {
    data: TicketsByPriorityType[] | undefined;
    className?: string;
}

export const TicketsByPriority: React.FC<TicketsByPriorityProps> = ({
    data,
    className = '',
}) => {
    const total = data?.reduce((sum, item) => sum + item.count, 0) || 0;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                By Priority
            </h3>
            <div className="space-y-4">
                {!data || data.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No priority data available
                    </p>
                ) : (
                    data.map((item) => {
                        const percentage = total > 0 ? (item.count / total) * 100 : 0;

                        return (
                            <div key={item.priority}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                        <span
                                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.priority}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {item.count}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: item.color
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};