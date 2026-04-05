using HelpDesk.Domain.Enums;

namespace HelpDesk.Domain.Events;

public class TicketStatusChangedEvent
{
    public Guid TicketId { get; }
    public string TicketNumber { get; }
    public TicketStatus OldStatus { get; }
    public TicketStatus NewStatus { get; }
    public string ChangedByUserId { get; }
    public DateTime ChangedAt { get; }

    public TicketStatusChangedEvent(
        Guid ticketId,
        string ticketNumber,
        TicketStatus oldStatus,
        TicketStatus newStatus,
        string changedByUserId)
    {
        TicketId = ticketId;
        TicketNumber = ticketNumber;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        ChangedByUserId = changedByUserId;
        ChangedAt = DateTime.UtcNow;
    }

    public TicketStatusChangedEvent(
        Guid ticketId,
        string ticketNumber,
        TicketStatus oldStatus,
        TicketStatus newStatus,
        string changedByUserId,
        DateTime changedAt)
    {
        TicketId = ticketId;
        TicketNumber = ticketNumber;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        ChangedByUserId = changedByUserId;
        ChangedAt = changedAt;
    }
}