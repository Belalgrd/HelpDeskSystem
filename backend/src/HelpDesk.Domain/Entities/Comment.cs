using HelpDesk.Domain.Common;

namespace HelpDesk.Domain.Entities;

public class Comment : AuditableEntity
{
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; } = false;

    public Guid TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}