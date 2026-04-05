using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Notifications;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationHubContext _hubContext;

    public NotificationService(
        IApplicationDbContext context,
        INotificationHubContext hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<NotificationSummaryDto> GetUserNotificationsAsync(string userId, int count = 20)
    {
        var totalCount = await _context.Notifications
            .Where(n => n.UserId == userId)
            .CountAsync();

        var unreadCount = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(count)
            .ToListAsync();

        return new NotificationSummaryDto
        {
            TotalCount = totalCount,
            UnreadCount = unreadCount,
            RecentNotifications = notifications.Select(MapToDto).ToList()
        };
    }

    public async Task<PaginatedList<NotificationDto>> GetAllUserNotificationsAsync(
        string userId, int pageNumber = 1, int pageSize = 20)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = items.Select(MapToDto).ToList();

        return new PaginatedList<NotificationDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task<NotificationDto?> GetByIdAsync(Guid id, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        return notification == null ? null : MapToDto(notification);
    }

    public async Task MarkAsReadAsync(Guid id, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var unreadCount = await GetUnreadCountAsync(userId);
            await _hubContext.SendToUserAsync(userId, "UnreadCountUpdated", unreadCount);
        }
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        var now = DateTime.UtcNow;
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _context.SaveChangesAsync();
        await _hubContext.SendToUserAsync(userId, "UnreadCountUpdated", 0);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAllAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();
        await _hubContext.SendToUserAsync(userId, "UnreadCountUpdated", 0);
    }

    public async Task CreateAndSendAsync(CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            TicketId = dto.TicketId,
            TicketNumber = dto.TicketNumber,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var realTimeDto = new RealTimeNotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type.ToString(),
            TypeCategory = GetTypeCategory(notification.Type),
            CreatedAt = notification.CreatedAt,
            TicketId = notification.TicketId,
            TicketNumber = notification.TicketNumber
        };

        await _hubContext.SendToUserAsync(dto.UserId, "ReceiveNotification", realTimeDto);
    }

    public async Task CreateAndSendToMultipleAsync(List<CreateNotificationDto> dtos)
    {
        foreach (var dto in dtos)
        {
            await CreateAndSendAsync(dto);
        }
    }

    public async Task NotifyTicketCreatedAsync(
        Guid ticketId, string ticketNumber, string title, string requesterId, string? departmentId)
    {
        // Use UserRole enum instead of string
        var admins = await _context.Users
            .Where(u => u.Role == UserRole.Admin && u.Id != requesterId)
            .Select(u => u.Id)
            .ToListAsync();

        var notifications = admins.Select(adminId => new CreateNotificationDto
        {
            UserId = adminId,
            Title = "New Ticket Created",
            Message = $"New ticket {ticketNumber}: {TruncateString(title, 50)}",
            Type = NotificationType.TicketCreated,
            TicketId = ticketId,
            TicketNumber = ticketNumber
        }).ToList();

        await CreateAndSendToMultipleAsync(notifications);
    }

    public async Task NotifyTicketAssignedAsync(
        Guid ticketId, string ticketNumber, string title, string assigneeId, string assignedByName)
    {
        await CreateAndSendAsync(new CreateNotificationDto
        {
            UserId = assigneeId,
            Title = "Ticket Assigned to You",
            Message = $"Ticket {ticketNumber} has been assigned to you by {assignedByName}",
            Type = NotificationType.TicketAssigned,
            TicketId = ticketId,
            TicketNumber = ticketNumber
        });
    }

    public async Task NotifyTicketStatusChangedAsync(
        Guid ticketId, string ticketNumber, string oldStatus, string newStatus,
        string requesterId, string? assigneeId)
    {
        var usersToNotify = new List<string> { requesterId };
        if (!string.IsNullOrEmpty(assigneeId) && assigneeId != requesterId)
        {
            usersToNotify.Add(assigneeId);
        }

        var notificationType = newStatus switch
        {
            "Resolved" => NotificationType.TicketResolved,
            "Closed" => NotificationType.TicketClosed,
            _ => NotificationType.TicketStatusChanged
        };

        var notifications = usersToNotify.Select(userId => new CreateNotificationDto
        {
            UserId = userId,
            Title = newStatus == "Resolved" ? "Ticket Resolved" :
                    newStatus == "Closed" ? "Ticket Closed" : "Ticket Status Updated",
            Message = $"Ticket {ticketNumber} status changed from {oldStatus} to {newStatus}",
            Type = notificationType,
            TicketId = ticketId,
            TicketNumber = ticketNumber
        }).ToList();

        await CreateAndSendToMultipleAsync(notifications);
    }

    public async Task NotifyTicketCommentedAsync(
        Guid ticketId, string ticketNumber, string commenterName,
        string requesterId, string? assigneeId, string commenterId)
    {
        var usersToNotify = new List<string>();

        if (requesterId != commenterId)
            usersToNotify.Add(requesterId);

        if (!string.IsNullOrEmpty(assigneeId) && assigneeId != commenterId && assigneeId != requesterId)
            usersToNotify.Add(assigneeId);

        var notifications = usersToNotify.Select(userId => new CreateNotificationDto
        {
            UserId = userId,
            Title = "New Comment on Ticket",
            Message = $"{commenterName} commented on ticket {ticketNumber}",
            Type = NotificationType.TicketCommented,
            TicketId = ticketId,
            TicketNumber = ticketNumber
        }).ToList();

        await CreateAndSendToMultipleAsync(notifications);
    }

    public async Task NotifyHighPriorityTicketAsync(
        Guid ticketId, string ticketNumber, string title, string priority)
    {
        // Use UserRole enum instead of string
        var usersToNotify = await _context.Users
            .Where(u => u.Role == UserRole.Admin || u.Role == UserRole.Agent)
            .Select(u => u.Id)
            .ToListAsync();

        var notifications = usersToNotify.Select(userId => new CreateNotificationDto
        {
            UserId = userId,
            Title = $"{priority} Priority Ticket",
            Message = $"New {priority.ToLower()} priority ticket: {ticketNumber} - {TruncateString(title, 40)}",
            Type = NotificationType.HighPriorityTicket,
            TicketId = ticketId,
            TicketNumber = ticketNumber
        }).ToList();

        await CreateAndSendToMultipleAsync(notifications);
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type.ToString(),
            TypeCategory = GetTypeCategory(notification.Type),
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt,
            TicketId = notification.TicketId,
            TicketNumber = notification.TicketNumber
        };
    }

    private static string GetTypeCategory(NotificationType type)
    {
        return type switch
        {
            NotificationType.TicketCreated => "info",
            NotificationType.TicketAssigned => "info",
            NotificationType.TicketUpdated => "info",
            NotificationType.TicketStatusChanged => "success",
            NotificationType.TicketCommented => "info",
            NotificationType.TicketResolved => "success",
            NotificationType.TicketClosed => "success",
            NotificationType.HighPriorityTicket => "warning",
            NotificationType.TicketOverdue => "error",
            NotificationType.TicketMention => "info",
            _ => "info"
        };
    }

    private static string TruncateString(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return value;
        return value.Length <= maxLength ? value : value[..maxLength] + "...";
    }
}