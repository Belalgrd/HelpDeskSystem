import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ticketsApi } from '../api/tickets.api';
import { attachmentsApi } from '../api/attachments.api';
import type {
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketFilter,
    CreateCommentRequest,
    UpdateCommentRequest,
    TicketStatus,
} from '../types/ticket.types';

export const useTickets = (filter: TicketFilter) => {
    return useQuery({
        queryKey: ['tickets', filter],
        queryFn: () => ticketsApi.getTickets(filter),
    });
};

export const useTicket = (id: string) => {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketsApi.getTicketById(id),
        enabled: !!id,
    });
};

export const useCreateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTicketRequest) => ticketsApi.createTicket(data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
                toast.success('Ticket created successfully!');
            } else {
                toast.error(response.message || 'Failed to create ticket');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to create ticket');
        },
    });
};

export const useUpdateTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTicketRequest }) =>
            ticketsApi.updateTicket(id, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Ticket updated successfully!');
            } else {
                toast.error(response.message || 'Failed to update ticket');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update ticket');
        },
    });
};

export const useDeleteTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => ticketsApi.deleteTicket(id),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
                toast.success('Ticket deleted successfully!');
            } else {
                toast.error(response.message || 'Failed to delete ticket');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete ticket');
        },
    });
};

export const useUpdateTicketStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
            ticketsApi.updateStatus(id, status),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Status updated successfully!');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update status');
        },
    });
};

export const useAssignTicket = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) =>
            ticketsApi.assignTicket(id, assigneeId),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Ticket assigned successfully!');
            } else {
                toast.error(response.message || 'Failed to assign ticket');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to assign ticket');
        },
    });
};

// Comment hooks
export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, data }: { ticketId: string; data: CreateCommentRequest }) =>
            ticketsApi.addComment(ticketId, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Comment added successfully!');
            } else {
                toast.error(response.message || 'Failed to add comment');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to add comment');
        },
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, commentId, data }: { ticketId: string; commentId: string; data: UpdateCommentRequest }) =>
            ticketsApi.updateComment(ticketId, commentId, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Comment updated successfully!');
            } else {
                toast.error(response.message || 'Failed to update comment');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update comment');
        },
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, commentId }: { ticketId: string; commentId: string }) =>
            ticketsApi.deleteComment(ticketId, commentId),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Comment deleted successfully!');
            } else {
                toast.error(response.message || 'Failed to delete comment');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete comment');
        },
    });
};

// Attachment hooks
export const useUploadTicketAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) =>
            attachmentsApi.uploadTicketAttachment(ticketId, file),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('File uploaded successfully!');
            } else {
                toast.error(response.message || 'Failed to upload file');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to upload file');
        },
    });
};

export const useDeleteAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (attachmentId: string) => attachmentsApi.deleteAttachment(attachmentId),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['ticket'] });
                toast.success('Attachment deleted successfully!');
            } else {
                toast.error(response.message || 'Failed to delete attachment');
            }
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete attachment');
        },
    });
};