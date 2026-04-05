using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HelpDesk.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttachmentsController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentsController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    /// <summary>
    /// Upload attachment to a ticket
    /// </summary>
    [HttpPost("ticket/{ticketId:guid}")]
    public async Task<ActionResult<ApiResponse<AttachmentDto>>> UploadTicketAttachment(
        Guid ticketId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<AttachmentDto>.ErrorResponse("No file provided"));

        var fileDto = new FileUploadDto
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = file.OpenReadStream()
        };

        var attachment = await _attachmentService.UploadTicketAttachmentAsync(ticketId, fileDto, UserId);

        if (attachment == null)
            return BadRequest(ApiResponse<AttachmentDto>.ErrorResponse("Failed to upload file. Check file size and type."));

        return Ok(ApiResponse<AttachmentDto>.SuccessResponse(attachment, "File uploaded successfully"));
    }

    /// <summary>
    /// Upload attachment to a comment
    /// </summary>
    [HttpPost("comment/{commentId:guid}")]
    public async Task<ActionResult<ApiResponse<AttachmentDto>>> UploadCommentAttachment(
        Guid commentId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<AttachmentDto>.ErrorResponse("No file provided"));

        var fileDto = new FileUploadDto
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            Content = file.OpenReadStream()
        };

        var attachment = await _attachmentService.UploadCommentAttachmentAsync(commentId, fileDto, UserId);

        if (attachment == null)
            return BadRequest(ApiResponse<AttachmentDto>.ErrorResponse("Failed to upload file. Check file size and type."));

        return Ok(ApiResponse<AttachmentDto>.SuccessResponse(attachment, "File uploaded successfully"));
    }

    /// <summary>
    /// Download an attachment
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> DownloadAttachment(Guid id)
    {
        var result = await _attachmentService.DownloadAttachmentAsync(id);

        if (result == null)
            return NotFound(ApiResponse<bool>.ErrorResponse("Attachment not found"));

        return File(result.FileData, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Delete an attachment
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAttachment(Guid id)
    {
        var result = await _attachmentService.DeleteAttachmentAsync(id, UserId);

        if (!result)
            return NotFound(ApiResponse<bool>.ErrorResponse("Attachment not found"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Attachment deleted successfully"));
    }

    /// <summary>
    /// Get all attachments for a ticket
    /// </summary>
    [HttpGet("ticket/{ticketId:guid}")]
    public async Task<ActionResult<ApiResponse<List<AttachmentDto>>>> GetTicketAttachments(Guid ticketId)
    {
        var attachments = await _attachmentService.GetTicketAttachmentsAsync(ticketId);
        return Ok(ApiResponse<List<AttachmentDto>>.SuccessResponse(attachments));
    }
}