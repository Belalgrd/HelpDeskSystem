namespace HelpDesk.Application.Services;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string resetUrl);
    Task<bool> SendWelcomeEmailAsync(string toEmail, string userName);
    Task<bool> SendTicketCreatedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject);
    Task<bool> SendTicketAssignedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject);
    Task<bool> SendTicketStatusChangedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject, string oldStatus, string newStatus);
    Task<bool> SendTicketCommentEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject, string commenterName);
}