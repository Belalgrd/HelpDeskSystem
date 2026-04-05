import api from './axios';
import type { ApiResponse, DashboardStats, AgentPerformanceReport } from '../types/common.types';
import type { Ticket } from '../types/ticket.types';

export const dashboardApi = {
    getStats: async (period: string = 'week'): Promise<ApiResponse<DashboardStats>> => {
        const response = await api.get<ApiResponse<DashboardStats>>(`/dashboard/stats?period=${period}`);
        return response.data;
    },

    getRecentTickets: async (count: number = 5): Promise<ApiResponse<Ticket[]>> => {
        const response = await api.get<ApiResponse<Ticket[]>>(`/dashboard/recent-tickets?count=${count}`);
        return response.data;
    },

    getAgentPerformance: async (period: string = 'week'): Promise<ApiResponse<AgentPerformanceReport>> => {
        const response = await api.get<ApiResponse<AgentPerformanceReport>>(`/dashboard/agent-performance?period=${period}`);
        return response.data;
    },
};