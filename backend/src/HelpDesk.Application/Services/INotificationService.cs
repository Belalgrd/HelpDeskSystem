using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Notifications;
using HelpDesk.Domain.Enums;

namespace HelpDesk.Application.Services;

public interface INotificationService
{
    Task<NotificationSummaryDto> GetUserNotificationsAsync(string userId, int count = 20);
    Task<PaginatedList<NotificationDto>> GetAllUserNotificationsAsync(string userId, int pageNumber = 1, int pageSize = 20);
    Task<int> GetUnreadCountAsync(string userId);
    Task<NotificationDto?> GetByIdAsync(Guid id, string userId);
    Task MarkAsReadAsync(Guid id, string userId);
    Task MarkAllAsReadAsync(string userId);
    Task DeleteAsync(Guid id, string userId);
    Task DeleteAllAsync(string userId);

    // Methods to create and send notifications
    Task CreateAndSendAsync(CreateNotificationDto dto);
    Task CreateAndSendToMultipleAsync(List<CreateNotificationDto> dtos);

    // Convenience methods for common notification types
    Task NotifyTicketCreatedAsync(Guid ticketId, string ticketNumber, string title, string requesterId, string? departmentId);
    Task NotifyTicketAssignedAsync(Guid ticketId, string ticketNumber, string title, string assigneeId, string assignedByName);
    Task NotifyTicketStatusChangedAsync(Guid ticketId, string ticketNumber, string oldStatus, string newStatus, string requesterId, string? assigneeId);
    Task NotifyTicketCommentedAsync(Guid ticketId, string ticketNumber, string commenterName, string requesterId, string? assigneeId, string commenterId);
    Task NotifyHighPriorityTicketAsync(Guid ticketId, string ticketNumber, string title, string priority);
}