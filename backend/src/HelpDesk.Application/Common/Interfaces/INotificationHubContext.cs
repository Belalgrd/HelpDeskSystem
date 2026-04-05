namespace HelpDesk.Application.Common.Interfaces;

public interface INotificationHubContext
{
    Task SendToUserAsync(string userId, string method, object data);
    Task SendToGroupAsync(string groupName, string method, object data);
}