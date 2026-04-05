using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HelpDesk.Infrastructure.Services;

public class AttachmentService : IAttachmentService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly string _uploadPath;
    private readonly long _maxFileSize;
    private readonly string[] _allowedExtensions;

    public AttachmentService(
        IApplicationDbContext context,
        IMapper mapper,
        IConfiguration configuration)
    {
        _context = context;
        _mapper = mapper;

        // Get configuration or use defaults
        _uploadPath = configuration["FileStorage:UploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _maxFileSize = configuration.GetValue<long>("FileStorage:MaxFileSizeInBytes", 10 * 1024 * 1024); // 10MB default
        _allowedExtensions = configuration.GetSection("FileStorage:AllowedExtensions").Get<string[]>()
            ?? new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".zip" };

        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public async Task<AttachmentDto?> UploadTicketAttachmentAsync(Guid ticketId, FileUploadDto file, string userId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null)
            return null;

        return await UploadFileAsync(file, userId, ticketId: ticketId);
    }

    public async Task<AttachmentDto?> UploadCommentAttachmentAsync(Guid commentId, FileUploadDto file, string userId)
    {
        var comment = await _context.Comments.FindAsync(commentId);
        if (comment == null)
            return null;

        return await UploadFileAsync(file, userId, commentId: commentId);
    }

    public async Task<FileDownloadDto?> DownloadAttachmentAsync(Guid attachmentId)
    {
        var attachment = await _context.Attachments.FindAsync(attachmentId);
        if (attachment == null)
            return null;

        var filePath = Path.Combine(_uploadPath, attachment.FilePath);
        if (!File.Exists(filePath))
            return null;

        var fileData = await File.ReadAllBytesAsync(filePath);

        return new FileDownloadDto
        {
            FileData = fileData,
            ContentType = attachment.ContentType,
            FileName = attachment.OriginalFileName
        };
    }

    public async Task<bool> DeleteAttachmentAsync(Guid attachmentId, string userId)
    {
        var attachment = await _context.Attachments.FindAsync(attachmentId);
        if (attachment == null)
            return false;

        // Delete physical file
        var filePath = Path.Combine(_uploadPath, attachment.FilePath);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        // Delete database record
        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<AttachmentDto>> GetTicketAttachmentsAsync(Guid ticketId)
    {
        var attachments = await _context.Attachments
            .Where(a => a.TicketId == ticketId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return _mapper.Map<List<AttachmentDto>>(attachments);
    }

    private async Task<AttachmentDto?> UploadFileAsync(
        FileUploadDto file,
        string userId,
        Guid? ticketId = null,
        Guid? commentId = null)
    {
        // Validate file
        if (file == null || file.Length == 0)
            return null;

        if (file.Length > _maxFileSize)
            return null;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return null;

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";

        // Create subdirectory based on date
        var dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
        var relativePath = Path.Combine(dateFolder, fileName);
        var fullDirectory = Path.Combine(_uploadPath, dateFolder);

        if (!Directory.Exists(fullDirectory))
        {
            Directory.CreateDirectory(fullDirectory);
        }

        var fullPath = Path.Combine(_uploadPath, relativePath);

        // Save file
        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.Content.CopyToAsync(stream);
        }

        // Create database record
        var attachment = new Attachment
        {
            FileName = fileName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            FilePath = relativePath,
            TicketId = ticketId,
            CommentId = commentId,
            CreatedBy = userId
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return _mapper.Map<AttachmentDto>(attachment);
    }
}