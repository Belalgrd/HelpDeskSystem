using HelpDesk.Application.Common.Models;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HelpDesk.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    /// <summary>
    /// Get notification summary with recent notifications
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int count = 20)
    {
        var result = await _notificationService.GetUserNotificationsAsync(GetUserId(), count);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>
    /// Get all notifications with pagination
    /// </summary>
    [HttpGet("all")]
    public async Task<IActionResult> GetAllNotifications(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _notificationService.GetAllUserNotificationsAsync(
            GetUserId(), pageNumber, pageSize);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    /// <summary>
    /// Get unread notification count
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(GetUserId());
        return Ok(ApiResponse<int>.SuccessResponse(count));
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notificationService.MarkAsReadAsync(id, GetUserId());
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Notification marked as read"));
    }

    /// <summary>
    /// Mark all notifications as read
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetUserId());
        return Ok(ApiResponse<object>.SuccessResponse(null!, "All notifications marked as read"));
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _notificationService.DeleteAsync(id, GetUserId());
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Notification deleted"));
    }

    /// <summary>
    /// Delete all notifications
    /// </summary>
    [HttpDelete("clear-all")]
    public async Task<IActionResult> DeleteAll()
    {
        await _notificationService.DeleteAllAsync(GetUserId());
        return Ok(ApiResponse<object>.SuccessResponse(null!, "All notifications cleared"));
    }
}