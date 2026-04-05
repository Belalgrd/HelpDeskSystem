using HelpDesk.Application.DTOs.Tickets;

namespace HelpDesk.Application.Services;

public interface IAttachmentService
{
    Task<AttachmentDto?> UploadTicketAttachmentAsync(Guid ticketId, FileUploadDto file, string userId);
    Task<AttachmentDto?> UploadCommentAttachmentAsync(Guid commentId, FileUploadDto file, string userId);
    Task<FileDownloadDto?> DownloadAttachmentAsync(Guid attachmentId);
    Task<bool> DeleteAttachmentAsync(Guid attachmentId, string userId);
    Task<List<AttachmentDto>> GetTicketAttachmentsAsync(Guid ticketId);
}