using HelpDesk.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace HelpDesk.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly bool _isEmailEnabled;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _isEmailEnabled = bool.Parse(_configuration["SmtpSettings:EnableEmailSending"] ?? "false");
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string resetUrl)
    {
        var subject = "Reset Your Password - HelpDesk";
        var body = GetPasswordResetEmailTemplate(userName, resetUrl);
        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var subject = "Welcome to HelpDesk!";
        var body = GetWelcomeEmailTemplate(userName);
        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendTicketCreatedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject)
    {
        var subject = $"Ticket Created: #{ticketNumber} - {ticketSubject}";
        var body = GetTicketCreatedEmailTemplate(userName, ticketNumber, ticketSubject);
        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendTicketAssignedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject)
    {
        var subject = $"Ticket Assigned: #{ticketNumber} - {ticketSubject}";
        var body = GetTicketAssignedEmailTemplate(userName, ticketNumber, ticketSubject);
        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendTicketStatusChangedEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject, string oldStatus, string newStatus)
    {
        var subject = $"Ticket Status Updated: #{ticketNumber} - {ticketSubject}";
        var body = GetTicketStatusChangedEmailTemplate(userName, ticketNumber, ticketSubject, oldStatus, newStatus);
        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendTicketCommentEmailAsync(string toEmail, string userName, string ticketNumber, string ticketSubject, string commenterName)
    {
        var subject = $"New Comment on Ticket: #{ticketNumber} - {ticketSubject}";
        var body = GetTicketCommentEmailTemplate(userName, ticketNumber, ticketSubject, commenterName);
        return await SendEmailAsync(toEmail, subject, body);
    }

    private async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        if (!_isEmailEnabled)
        {
            _logger.LogInformation("Email sending is disabled. Would have sent email to {ToEmail} with subject: {Subject}", toEmail, subject);
            return true;
        }

        try
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var host = smtpSettings["Host"];
            var port = int.Parse(smtpSettings["Port"] ?? "587");
            var username = smtpSettings["Username"];
            var password = smtpSettings["Password"];
            var fromEmail = smtpSettings["FromEmail"] ?? username;
            var fromName = smtpSettings["FromName"] ?? "HelpDesk";
            var enableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true");

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("SMTP settings are not properly configured. Email not sent to {ToEmail}", toEmail);
                return false;
            }

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation("Email sent successfully to {ToEmail} with subject: {Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail} with subject: {Subject}", toEmail, subject);
            return false;
        }
    }

    #region Email Templates

    private string GetBaseTemplate(string title, string content)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;'>
    <table role='presentation' style='width: 100%; border-collapse: collapse;'>
        <tr>
            <td align='center' style='padding: 40px 0;'>
                <table role='presentation' style='width: 100%; max-width: 600px; border-collapse: collapse;'>
                    <!-- Header -->
                    <tr>
                        <td style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;'>
                            <h1 style='color: white; margin: 0; font-size: 28px; font-weight: 700;'>🎫 HelpDesk</h1>
                            <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;'>Support Ticket System</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style='background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);'>
                            {content}
                            <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                            <p style='color: #999; font-size: 12px; text-align: center; margin: 0;'>
                                This email was sent by HelpDesk System.<br>
                                Please do not reply directly to this email.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style='padding: 20px 30px; text-align: center;'>
                            <p style='color: #999; font-size: 12px; margin: 0;'>
                                © {DateTime.Now.Year} HelpDesk. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }

    private string GetPasswordResetEmailTemplate(string userName, string resetUrl)
    {
        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>Password Reset Request</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{resetUrl}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    Reset Password
                </a>
            </div>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 25px 0;'>
                <p style='color: #666; font-size: 13px; margin: 0;'>
                    <strong>⏰ This link will expire in 24 hours.</strong><br>
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
            <p style='color: #666; font-size: 13px; margin: 20px 0 0 0;'>
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href='{resetUrl}' style='color: #667eea; word-break: break-all;'>{resetUrl}</a>
            </p>";

        return GetBaseTemplate("Reset Your Password", content);
    }

    private string GetWelcomeEmailTemplate(string userName)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>Welcome to HelpDesk! 🎉</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'>Thank you for creating an account with HelpDesk. We're excited to have you on board!</p>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>
                <p style='color: #333; font-weight: 600; margin: 0 0 15px 0;'>With HelpDesk, you can:</p>
                <ul style='color: #666; margin: 0; padding-left: 20px;'>
                    <li style='margin-bottom: 8px;'>📝 Create and track support tickets</li>
                    <li style='margin-bottom: 8px;'>🔔 Get real-time updates on your requests</li>
                    <li style='margin-bottom: 8px;'>💬 Communicate with our support team</li>
                    <li style='margin-bottom: 8px;'>📊 View your ticket history and status</li>
                </ul>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{frontendUrl}/login' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    Go to Dashboard
                </a>
            </div>";

        return GetBaseTemplate("Welcome to HelpDesk", content);
    }

    private string GetTicketCreatedEmailTemplate(string userName, string ticketNumber, string ticketSubject)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>Ticket Created Successfully</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'>Your support ticket has been created successfully. Our team will review it shortly.</p>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>Ticket Number:</strong> #{ticketNumber}</p>
                <p style='margin: 0;'><strong>Subject:</strong> {ticketSubject}</p>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{frontendUrl}/tickets/{ticketNumber}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    View Ticket
                </a>
            </div>";

        return GetBaseTemplate("Ticket Created", content);
    }

    private string GetTicketAssignedEmailTemplate(string userName, string ticketNumber, string ticketSubject)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>Ticket Assigned to You</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'>A support ticket has been assigned to you. Please review and take appropriate action.</p>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>Ticket Number:</strong> #{ticketNumber}</p>
                <p style='margin: 0;'><strong>Subject:</strong> {ticketSubject}</p>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{frontendUrl}/tickets/{ticketNumber}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    View Ticket
                </a>
            </div>";

        return GetBaseTemplate("Ticket Assigned", content);
    }

    private string GetTicketStatusChangedEmailTemplate(string userName, string ticketNumber, string ticketSubject, string oldStatus, string newStatus)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        var statusColor = newStatus.ToLower() switch
        {
            "resolved" or "closed" => "#22c55e",
            "in progress" => "#3b82f6",
            "pending" => "#f59e0b",
            _ => "#667eea"
        };

        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>Ticket Status Updated</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'>The status of your support ticket has been updated.</p>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>Ticket Number:</strong> #{ticketNumber}</p>
                <p style='margin: 0 0 10px 0;'><strong>Subject:</strong> {ticketSubject}</p>
                <p style='margin: 0;'>
                    <strong>Status:</strong> 
                    <span style='text-decoration: line-through; color: #999;'>{oldStatus}</span> 
                    → 
                    <span style='background: {statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;'>{newStatus}</span>
                </p>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{frontendUrl}/tickets/{ticketNumber}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    View Ticket
                </a>
            </div>";

        return GetBaseTemplate("Ticket Status Updated", content);
    }

    private string GetTicketCommentEmailTemplate(string userName, string ticketNumber, string ticketSubject, string commenterName)
    {
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

        var content = $@"
            <h2 style='color: #333; margin: 0 0 20px 0; font-size: 22px;'>New Comment on Your Ticket</h2>
            <p style='margin: 0 0 15px 0;'>Hello <strong>{userName}</strong>,</p>
            <p style='margin: 0 0 25px 0;'><strong>{commenterName}</strong> has added a new comment to your support ticket.</p>
            <div style='background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;'>
                <p style='margin: 0 0 10px 0;'><strong>Ticket Number:</strong> #{ticketNumber}</p>
                <p style='margin: 0;'><strong>Subject:</strong> {ticketSubject}</p>
            </div>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{frontendUrl}/tickets/{ticketNumber}' style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;'>
                    View Comment
                </a>
            </div>";

        return GetBaseTemplate("New Comment", content);
    }

    #endregion
}