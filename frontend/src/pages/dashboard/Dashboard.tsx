import React, { useState } from 'react';
import {
    DashboardHeader,
    StatsCardGrid,
    TicketTrendChart,
    TicketsByPriority,
    TicketsByDepartment,
    RecentTickets,
} from '../../components/dashboard';
import { PageLoading } from '../../components/common/Loading';
import { useDashboardStats, useRecentTickets } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';

export const Dashboard: React.FC = () => {
    const [period, setPeriod] = useState('week');
    const { user } = useAuthStore();

    // Fetch dashboard data
    const { data: statsResponse, isLoading: statsLoading } = useDashboardStats(period);
    const { data: recentResponse, isLoading: recentLoading } = useRecentTickets(5);

    // Extract data from responses
    const stats = statsResponse?.data;
    const recentTickets = recentResponse?.data || [];

    // Show loading state
    if (statsLoading) {
        return <PageLoading />;
    }

    return (
        <div className="space-y-6">
            {/* Header with Period Selector */}
            <DashboardHeader
                userName={user?.firstName}
                period={period}
                onPeriodChange={setPeriod}
            />

            {/* Stats Cards Grid */}
            <StatsCardGrid stats={stats} />

            {/* Charts Section - Trend Chart & Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TicketTrendChart
                    data={stats?.ticketTrend}
                    className="lg:col-span-2"
                />
                <TicketsByPriority
                    data={stats?.ticketsByPriority}
                />
            </div>

            {/* Bottom Section - Recent Tickets & Department */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentTickets
                    tickets={recentTickets}
                    isLoading={recentLoading}
                />
                <TicketsByDepartment
                    data={stats?.ticketsByDepartment}
                />
            </div>
        </div>
    );
};