using HelpDesk.Domain.Enums;

namespace HelpDesk.Application.DTOs.Tickets;

public class TicketDto
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public TicketPriority Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string RequesterId { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string? RequesterAvatar { get; set; }
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public int CommentsCount { get; set; }
    public int AttachmentsCount { get; set; }
}

public class TicketDetailDto : TicketDto
{
    public string? RequesterEmail { get; set; }
    public List<CommentDto> Comments { get; set; } = new();
    public List<AttachmentDto> Attachments { get; set; } = new();
    public List<TicketHistoryDto> History { get; set; } = new();
}

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public Guid CategoryId { get; set; }
    public Guid DepartmentId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketPriority Priority { get; set; }
    public Guid CategoryId { get; set; }
    public Guid DepartmentId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateTicketStatusDto
{
    public TicketStatus Status { get; set; }
}

public class AssignTicketDto
{
    public string AssigneeId { get; set; } = string.Empty;
}

public class TicketFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public TicketStatus? Status { get; set; }
    public TicketPriority? Priority { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? AssigneeId { get; set; }
    public string? RequesterId { get; set; }
    public string SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<AttachmentDto> Attachments { get; set; } = new();
}

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; } = false;
}

public class UpdateCommentDto
{
    public string Content { get; set; } = string.Empty;
}

public class AttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
}

public class TicketHistoryDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

// File Upload/Download DTOs
public class FileUploadDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Length { get; set; }
    public Stream Content { get; set; } = null!;
}

public class FileDownloadDto
{
    public byte[] FileData { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}