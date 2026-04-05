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
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<TicketDto>>>> GetTickets([FromQuery] TicketFilterDto filter)
    {
        var result = await _ticketService.GetTicketsAsync(filter, UserId);
        return Ok(ApiResponse<PaginatedList<TicketDto>>.SuccessResponse(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TicketDetailDto>>> GetTicket(Guid id)
    {
        var ticket = await _ticketService.GetTicketByIdAsync(id);

        if (ticket == null)
            return NotFound(ApiResponse<TicketDetailDto>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<TicketDetailDto>.SuccessResponse(ticket));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TicketDto>>> CreateTicket([FromBody] CreateTicketDto dto)
    {
        var ticket = await _ticketService.CreateTicketAsync(dto, UserId);

        if (ticket == null)
            return BadRequest(ApiResponse<TicketDto>.ErrorResponse("Failed to create ticket"));

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id },
            ApiResponse<TicketDto>.SuccessResponse(ticket, "Ticket created successfully"));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TicketDto>>> UpdateTicket(Guid id, [FromBody] UpdateTicketDto dto)
    {
        var ticket = await _ticketService.UpdateTicketAsync(id, dto, UserId);

        if (ticket == null)
            return NotFound(ApiResponse<TicketDto>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<TicketDto>.SuccessResponse(ticket, "Ticket updated successfully"));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTicket(Guid id)
    {
        var result = await _ticketService.DeleteTicketAsync(id);

        if (!result)
            return NotFound(ApiResponse<bool>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Ticket deleted successfully"));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<TicketDto>>> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto dto)
    {
        var ticket = await _ticketService.UpdateTicketStatusAsync(id, dto, UserId);

        if (ticket == null)
            return NotFound(ApiResponse<TicketDto>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<TicketDto>.SuccessResponse(ticket, "Status updated successfully"));
    }

    [HttpPost("{id:guid}/assign")]
    public async Task<ActionResult<ApiResponse<TicketDto>>> AssignTicket(Guid id, [FromBody] AssignTicketDto dto)
    {
        var ticket = await _ticketService.AssignTicketAsync(id, dto, UserId);

        if (ticket == null)
            return NotFound(ApiResponse<TicketDto>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<TicketDto>.SuccessResponse(ticket, "Ticket assigned successfully"));
    }

    [HttpPost("{id:guid}/comments")]
    public async Task<ActionResult<ApiResponse<CommentDto>>> AddComment(Guid id, [FromBody] CreateCommentDto dto)
    {
        var comment = await _ticketService.AddCommentAsync(id, dto, UserId);

        if (comment == null)
            return NotFound(ApiResponse<CommentDto>.ErrorResponse("Ticket not found"));

        return Ok(ApiResponse<CommentDto>.SuccessResponse(comment, "Comment added successfully"));
    }

    [HttpPut("{ticketId:guid}/comments/{commentId:guid}")]
    public async Task<ActionResult<ApiResponse<CommentDto>>> UpdateComment(
        Guid ticketId,
        Guid commentId,
        [FromBody] UpdateCommentDto dto)
    {
        var comment = await _ticketService.UpdateCommentAsync(ticketId, commentId, dto, UserId);

        if (comment == null)
            return NotFound(ApiResponse<CommentDto>.ErrorResponse("Comment not found or you don't have permission to edit"));

        return Ok(ApiResponse<CommentDto>.SuccessResponse(comment, "Comment updated successfully"));
    }

    [HttpDelete("{ticketId:guid}/comments/{commentId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteComment(Guid ticketId, Guid commentId)
    {
        var result = await _ticketService.DeleteCommentAsync(ticketId, commentId, UserId);

        if (!result)
            return NotFound(ApiResponse<bool>.ErrorResponse("Comment not found or you don't have permission to delete"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Comment deleted successfully"));
    }
}