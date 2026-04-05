import api from './axios';
import type { ApiResponse, PaginatedList } from '../types/common.types';
import type {
    Ticket,
    TicketDetail,
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketFilter,
    Comment,
    CreateCommentRequest,
    UpdateCommentRequest,
    TicketStatus,
} from '../types/ticket.types';

export const ticketsApi = {
    getTickets: async (filter: TicketFilter): Promise<ApiResponse<PaginatedList<Ticket>>> => {
        const params = new URLSearchParams();

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const response = await api.get<ApiResponse<PaginatedList<Ticket>>>(`/tickets?${params}`);
        return response.data;
    },

    getTicketById: async (id: string): Promise<ApiResponse<TicketDetail>> => {
        const response = await api.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);
        return response.data;
    },

    createTicket: async (data: CreateTicketRequest): Promise<ApiResponse<Ticket>> => {
        const response = await api.post<ApiResponse<Ticket>>('/tickets', data);
        return response.data;
    },

    updateTicket: async (id: string, data: UpdateTicketRequest): Promise<ApiResponse<Ticket>> => {
        const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
        return response.data;
    },

    deleteTicket: async (id: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/tickets/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: TicketStatus): Promise<ApiResponse<Ticket>> => {
        const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, { status });
        return response.data;
    },

    assignTicket: async (id: string, assigneeId: string): Promise<ApiResponse<Ticket>> => {
        const response = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/assign`, { assigneeId });
        return response.data;
    },

    // Comment operations
    addComment: async (ticketId: string, data: CreateCommentRequest): Promise<ApiResponse<Comment>> => {
        const response = await api.post<ApiResponse<Comment>>(`/tickets/${ticketId}/comments`, data);
        return response.data;
    },

    updateComment: async (ticketId: string, commentId: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> => {
        const response = await api.put<ApiResponse<Comment>>(`/tickets/${ticketId}/comments/${commentId}`, data);
        return response.data;
    },

    deleteComment: async (ticketId: string, commentId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/tickets/${ticketId}/comments/${commentId}`);
        return response.data;
    },
};