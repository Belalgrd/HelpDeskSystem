using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Tickets;

namespace HelpDesk.Application.Services;

public interface ITicketService
{
    Task<PaginatedList<TicketDto>> GetTicketsAsync(TicketFilterDto filter, string? userId = null);
    Task<TicketDetailDto?> GetTicketByIdAsync(Guid id);
    Task<TicketDto?> CreateTicketAsync(CreateTicketDto dto, string userId);
    Task<TicketDto?> UpdateTicketAsync(Guid id, UpdateTicketDto dto, string userId);
    Task<bool> DeleteTicketAsync(Guid id);
    Task<TicketDto?> UpdateTicketStatusAsync(Guid id, UpdateTicketStatusDto dto, string userId);
    Task<TicketDto?> AssignTicketAsync(Guid id, AssignTicketDto dto, string userId);

    // Comment operations
    Task<CommentDto?> AddCommentAsync(Guid ticketId, CreateCommentDto dto, string userId);
    Task<CommentDto?> UpdateCommentAsync(Guid ticketId, Guid commentId, UpdateCommentDto dto, string userId);
    Task<bool> DeleteCommentAsync(Guid ticketId, Guid commentId, string userId);
}