export const TICKET_STATUSES = [
    { value: 'Open', label: 'Open' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Cancelled', label: 'Cancelled' },
] as const;

export const TICKET_PRIORITIES = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
] as const;

export const SORT_OPTIONS = [
    { value: 'CreatedAt', label: 'Created Date' },
    { value: 'Title', label: 'Title' },
    { value: 'Priority', label: 'Priority' },
    { value: 'Status', label: 'Status' },
    { value: 'DueDate', label: 'Due Date' },
] as const;

export const PAGE_SIZES = [10, 20, 50, 100] as const;