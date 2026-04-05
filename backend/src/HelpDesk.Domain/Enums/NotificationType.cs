namespace HelpDesk.Domain.Enums;

public enum NotificationType
{
    TicketCreated = 0,
    TicketAssigned = 1,
    TicketUpdated = 2,
    TicketStatusChanged = 3,
    TicketCommented = 4,
    TicketResolved = 5,
    TicketClosed = 6,
    HighPriorityTicket = 7,
    TicketOverdue = 8,
    TicketMention = 9
}