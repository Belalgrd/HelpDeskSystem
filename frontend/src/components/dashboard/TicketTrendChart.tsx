import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { TicketTrend } from '../../types/common.types';

interface TicketTrendChartProps {
    data: TicketTrend[] | undefined;
    className?: string;
}

// Define custom tooltip payload type
interface TooltipPayloadItem {
    name: string;
    value: number;
    color: string;
    dataKey: string;
}

// Define custom tooltip props type
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

// Properly typed custom tooltip component
const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                <p className="text-gray-900 dark:text-white font-medium mb-1">{label}</p>
                {payload.map((entry: TooltipPayloadItem, index: number) => (
                    <p
                        key={index}
                        style={{ color: entry.color }}
                        className="text-sm"
                    >
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const TicketTrendChart: React.FC<TicketTrendChartProps> = ({
    data,
    className = '',
}) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Trend
                </h3>
                <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="w-3 h-3 bg-primary-500 rounded-full mr-2" />
                        Created
                    </span>
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        Resolved
                    </span>
                </div>
            </div>
            <div className="h-72">
                {!data || data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        No trend data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                className="dark:opacity-20"
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '20px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="created"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Created"
                            />
                            <Line
                                type="monotone"
                                dataKey="resolved"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Resolved"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};