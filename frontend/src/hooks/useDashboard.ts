import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export const useDashboardStats = (period: string = 'week') => {
    return useQuery({
        queryKey: ['dashboard', 'stats', period],
        queryFn: () => dashboardApi.getStats(period),
        staleTime: 2 * 60 * 1000,
    });
};

export const useRecentTickets = (count: number = 5) => {
    return useQuery({
        queryKey: ['dashboard', 'recent-tickets', count],
        queryFn: () => dashboardApi.getRecentTickets(count),
        staleTime: 1 * 60 * 1000,
    });
};

export const useAgentPerformance = (period: string = 'week') => {
    return useQuery({
        queryKey: ['dashboard', 'agent-performance', period],
        queryFn: () => dashboardApi.getAgentPerformance(period),
        staleTime: 2 * 60 * 1000,
    });
};