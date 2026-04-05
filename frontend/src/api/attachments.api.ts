import api from './axios';
import type { ApiResponse } from '../types/common.types';
import type { Attachment } from '../types/ticket.types';

export const attachmentsApi = {
    uploadTicketAttachment: async (ticketId: string, file: File): Promise<ApiResponse<Attachment>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<Attachment>>(
            `/attachments/ticket/${ticketId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    uploadCommentAttachment: async (commentId: string, file: File): Promise<ApiResponse<Attachment>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<Attachment>>(
            `/attachments/comment/${commentId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    downloadAttachment: async (attachmentId: string): Promise<Blob> => {
        const response = await api.get(`/attachments/${attachmentId}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    deleteAttachment: async (attachmentId: string): Promise<ApiResponse<boolean>> => {
        const response = await api.delete<ApiResponse<boolean>>(`/attachments/${attachmentId}`);
        return response.data;
    },

    getTicketAttachments: async (ticketId: string): Promise<ApiResponse<Attachment[]>> => {
        const response = await api.get<ApiResponse<Attachment[]>>(`/attachments/ticket/${ticketId}`);
        return response.data;
    },
};