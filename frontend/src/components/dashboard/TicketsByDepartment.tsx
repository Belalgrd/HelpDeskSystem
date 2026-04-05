import React from 'react';
import type { TicketsByDepartment as TicketsByDepartmentType } from '../../types/common.types';

interface TicketsByDepartmentProps {
    data: TicketsByDepartmentType[] | undefined;
    className?: string;
}

export const TicketsByDepartment: React.FC<TicketsByDepartmentProps> = ({
    data,
    className = '',
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                By Department
            </h3>
            <div className="space-y-3">
                {!data || data.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No department data available
                    </p>
                ) : (
                    data.map((dept) => (
                        <div
                            key={dept.department}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {dept.department}
                            </span>
                            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
                                {dept.count}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};