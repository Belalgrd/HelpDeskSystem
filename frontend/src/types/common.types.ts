export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
}

export interface PaginatedList<T> {
    items: T[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface Department {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    parentCategoryId?: string;
}

export interface DashboardStats {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    overdueTickets: number;
    averageResolutionHours: number;
    ticketsCreatedToday: number;
    ticketsResolvedToday: number;
    ticketsByPriority: TicketsByPriority[];
    ticketsByDepartment: TicketsByDepartment[];
    ticketTrend: TicketTrend[];
}

export interface TicketsByPriority {
    priority: string;
    count: number;
    color: string;
}

export interface TicketsByDepartment {
    department: string;
    count: number;
}

export interface TicketTrend {
    date: string;
    created: number;
    resolved: number;
}


export interface CreateDepartmentRequest {
    name: string;
    description?: string;
}

export interface UpdateDepartmentRequest {
    name: string;
    description?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentCategoryId?: string;
}

export interface UpdateCategoryRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    parentCategoryId?: string;
}


export interface AgentPerformance {
    id: string;
    name: string;
    email: string;
    departmentName?: string;
    assignedTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    openTickets: number;
    avgResolutionTimeHours: number;
    slaCompliancePercent: number;
}

export interface AgentPerformanceSummary {
    totalAgents: number;
    avgResolvedPerAgent: number;
    avgResolutionTimeHours: number;
    overallSlaCompliancePercent: number;
}

export interface AgentPerformanceReport {
    agents: AgentPerformance[];
    summary: AgentPerformanceSummary;
}