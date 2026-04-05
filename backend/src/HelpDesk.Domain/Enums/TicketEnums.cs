namespace HelpDesk.Domain.Enums;

public enum TicketStatus
{
    Open = 1,
    InProgress = 2,
    Pending = 3,
    Resolved = 4,
    Closed = 5,
    Cancelled = 6
}

public enum TicketPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

public enum UserRole
{
    User = 1,
    Agent = 2,
    Supervisor = 3,
    Admin = 4
}