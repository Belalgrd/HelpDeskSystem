using HelpDesk.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace HelpDesk.API.Hubs;

public class NotificationHubContext : INotificationHubContext
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationHubContext(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendToUserAsync(string userId, string method, object data)
    {
        await _hubContext.Clients.Group($"user-{userId}").SendAsync(method, data);
    }

    public async Task SendToGroupAsync(string groupName, string method, object data)
    {
        await _hubContext.Clients.Group(groupName).SendAsync(method, data);
    }
}