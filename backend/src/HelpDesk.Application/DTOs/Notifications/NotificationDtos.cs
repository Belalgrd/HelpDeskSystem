using HelpDesk.Domain.Enums;

namespace HelpDesk.Application.DTOs.Notifications;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string TypeCategory { get; set; } = string.Empty; // info, success, warning, error
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public Guid? TicketId { get; set; }
    public string? TicketNumber { get; set; }
}

public class CreateNotificationDto
{
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public Guid? TicketId { get; set; }
    public string? TicketNumber { get; set; }
}

public class NotificationSummaryDto
{
    public int TotalCount { get; set; }
    public int UnreadCount { get; set; }
    public List<NotificationDto> RecentNotifications { get; set; } = new();
}

// Real-time notification payload for SignalR
public class RealTimeNotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string TypeCategory { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Guid? TicketId { get; set; }
    public string? TicketNumber { get; set; }
}