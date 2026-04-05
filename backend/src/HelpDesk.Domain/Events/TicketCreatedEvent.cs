using HelpDesk.Domain.Entities;

namespace HelpDesk.Domain.Events;

public class TicketCreatedEvent
{
    public Guid TicketId { get; }
    public string TicketNumber { get; }
    public string Title { get; }
    public string RequesterId { get; }
    public Guid DepartmentId { get; }
    public Guid CategoryId { get; }
    public DateTime CreatedAt { get; }

    public TicketCreatedEvent(Ticket ticket)
    {
        TicketId = ticket.Id;
        TicketNumber = ticket.TicketNumber;
        Title = ticket.Title;
        RequesterId = ticket.RequesterId;
        DepartmentId = ticket.DepartmentId;
        CategoryId = ticket.CategoryId;
        CreatedAt = ticket.CreatedAt;
    }

    public TicketCreatedEvent(
        Guid ticketId,
        string ticketNumber,
        string title,
        string requesterId,
        Guid departmentId,
        Guid categoryId,
        DateTime createdAt)
    {
        TicketId = ticketId;
        TicketNumber = ticketNumber;
        Title = title;
        RequesterId = requesterId;
        DepartmentId = departmentId;
        CategoryId = categoryId;
        CreatedAt = createdAt;
    }
}