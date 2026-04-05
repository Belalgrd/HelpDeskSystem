using HelpDesk.Domain.Common;

namespace HelpDesk.Domain.Entities;

public class Attachment : AuditableEntity
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FilePath { get; set; } = string.Empty;

    public Guid? TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    public Guid? CommentId { get; set; }
    public Comment? Comment { get; set; }
}