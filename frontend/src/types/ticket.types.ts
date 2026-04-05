export type TicketStatus = 'Open' | 'InProgress' | 'Pending' | 'Resolved' | 'Closed' | 'Cancelled';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ticket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    statusName: string;
    priority: TicketPriority;
    priorityName: string;
    categoryId: string;
    categoryName: string;
    departmentId: string;
    departmentName: string;
    requesterId: string;
    requesterName: string;
    requesterAvatar?: string;
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: string;
    dueDate?: string;
    resolvedAt?: string;
    closedAt?: string;
    commentsCount: number;
    attachmentsCount: number;
}

export interface TicketDetail extends Ticket {
    requesterEmail?: string;
    comments: Comment[];
    attachments: Attachment[];
    history: TicketHistory[];
}

export interface Comment {
    id: string;
    content: string;
    isInternal: boolean;
    userId: string;
    userName: string;
    userAvatar?: string;
    createdAt: string;
    updatedAt?: string;
    attachments: Attachment[];
}

export interface Attachment {
    id: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    downloadUrl: string;
}

export interface TicketHistory {
    id: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    userId: string;
    userName: string;
    timestamp: string;
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    priority: TicketPriority;
    categoryId: string;
    departmentId: string;
    dueDate?: string;
}

export interface UpdateTicketRequest {
    title: string;
    description: string;
    priority: TicketPriority;
    categoryId: string;
    departmentId: string;
    dueDate?: string;
}

export interface TicketFilter {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    categoryId?: string;
    departmentId?: string;
    assigneeId?: string;
    requesterId?: string;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface CreateCommentRequest {
    content: string;
    isInternal?: boolean;
}

export interface UpdateCommentRequest {
    content: string;
}