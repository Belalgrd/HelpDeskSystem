// src/components/dashboard/StatsCardGrid.tsx

import React from 'react';
import {
    HiTicket,
    HiClock,
    HiCheckCircle,
    HiExclamation,
} from 'react-icons/hi';
import { StatsCard } from './StatsCard';
import type { DashboardStats } from '../../types/common.types';

type ChangeType = 'positive' | 'negative' | 'neutral';

interface StatsCardConfig {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    changeType: ChangeType;
    gradient: string;
}

interface StatsCardGridProps {
    stats: DashboardStats | undefined;
}

// Helper function to calculate percentage change from trend data
const calculateTrendChange = (
    trend: { created: number; resolved: number }[] | undefined,
    type: 'created' | 'resolved'
): { change: string; changeType: ChangeType } => {
    if (!trend || trend.length < 2) {
        return { change: '', changeType: 'neutral' };
    }

    // Split trend into two halves and compare
    const midPoint = Math.floor(trend.length / 2);
    const firstHalf = trend.slice(0, midPoint);
    const secondHalf = trend.slice(midPoint);

    const firstSum = firstHalf.reduce((sum, item) => sum + item[type], 0);
    const secondSum = secondHalf.reduce((sum, item) => sum + item[type], 0);

    if (firstSum === 0) {
        if (secondSum > 0) {
            return { change: `+${secondSum} new`, changeType: 'positive' };
        }
        return { change: '', changeType: 'neutral' };
    }

    const percentChange = Math.round(((secondSum - firstSum) / firstSum) * 100);

    if (percentChange > 0) {
        return { change: `+${percentChange}%`, changeType: 'positive' };
    } else if (percentChange < 0) {
        return { change: `${percentChange}%`, changeType: 'negative' };
    }
    return { change: '0%', changeType: 'neutral' };
};

// Helper to format resolution time change
const getResolutionChangeInfo = (
    avgHours: number | undefined
): { change: string; changeType: ChangeType } => {
    if (!avgHours || avgHours === 0) {
        return { change: 'No data', changeType: 'neutral' };
    }

    // Consider < 24h as good, 24-48h as neutral, > 48h as bad
    if (avgHours < 24) {
        return { change: 'Excellent', changeType: 'positive' };
    } else if (avgHours < 48) {
        return { change: 'Good', changeType: 'neutral' };
    } else {
        return { change: 'Needs improvement', changeType: 'negative' };
    }
};

export const StatsCardGrid: React.FC<StatsCardGridProps> = ({ stats }) => {
    // Calculate real changes from trend data
    const totalTicketsChange = calculateTrendChange(stats?.ticketTrend, 'created');
    const resolvedChange = calculateTrendChange(stats?.ticketTrend, 'resolved');
    const resolutionInfo = getResolutionChangeInfo(stats?.averageResolutionHours);

    // Determine status for open tickets
    const getOpenTicketsInfo = (): { change: string; changeType: ChangeType } => {
        const open = stats?.openTickets || 0;
        const inProgress = stats?.inProgressTickets || 0;
        const total = open + inProgress;

        if (total === 0) {
            return { change: 'All clear!', changeType: 'positive' };
        } else if (total <= 5) {
            return { change: `${total} pending`, changeType: 'neutral' };
        } else if (total <= 10) {
            return { change: `${total} pending`, changeType: 'neutral' };
        } else {
            return { change: `${total} pending`, changeType: 'negative' };
        }
    };

    const openTicketsInfo = getOpenTicketsInfo();

    const statsConfig: StatsCardConfig[] = [
        {
            title: 'Total Tickets',
            value: stats?.totalTickets || 0,
            icon: <HiTicket className="w-7 h-7 text-white" />,
            change: totalTicketsChange.change || `${stats?.ticketsCreatedToday || 0} today`,
            changeType: totalTicketsChange.change ? totalTicketsChange.changeType : 'neutral',
            gradient: 'bg-gradient-to-br from-primary-500 to-purple-600',
        },
        {
            title: 'Open Tickets',
            value: stats?.openTickets || 0,
            icon: <HiClock className="w-7 h-7 text-white" />,
            change: openTicketsInfo.change,
            changeType: openTicketsInfo.changeType,
            gradient: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        },
        {
            title: 'Resolved Today',
            value: stats?.ticketsResolvedToday || 0,
            icon: <HiCheckCircle className="w-7 h-7 text-white" />,
            change: resolvedChange.change || `${stats?.resolvedTickets || 0} total`,
            changeType: resolvedChange.change ? resolvedChange.changeType : 'positive',
            gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
        },
        {
            title: 'Avg Resolution',
            value: `${stats?.averageResolutionHours?.toFixed(1) || 0}h`,
            icon: <HiExclamation className="w-7 h-7 text-white" />,
            change: resolutionInfo.change,
            changeType: resolutionInfo.changeType,
            gradient: 'bg-gradient-to-br from-red-500 to-pink-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat) => (
                <StatsCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    change={stat.change}
                    changeType={stat.changeType}
                    gradient={stat.gradient}
                />
            ))}
        </div>
    );
};