using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public TicketService(
        IApplicationDbContext context,
        IMapper mapper,
        INotificationService notificationService)
    {
        _context = context;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<PaginatedList<TicketDto>> GetTicketsAsync(TicketFilterDto filter, string? userId = null)
    {
        var query = _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.Department)
            .Include(t => t.Requester)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(search) ||
                t.TicketNumber.ToLower().Contains(search) ||
                t.Description.ToLower().Contains(search));
        }

        if (filter.Status.HasValue)
            query = query.Where(t => t.Status == filter.Status.Value);

        if (filter.Priority.HasValue)
            query = query.Where(t => t.Priority == filter.Priority.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == filter.CategoryId.Value);

        if (filter.DepartmentId.HasValue)
            query = query.Where(t => t.DepartmentId == filter.DepartmentId.Value);

        if (!string.IsNullOrEmpty(filter.AssigneeId))
            query = query.Where(t => t.AssigneeId == filter.AssigneeId);

        if (!string.IsNullOrEmpty(filter.RequesterId))
            query = query.Where(t => t.RequesterId == filter.RequesterId);

        // Apply sorting
        query = filter.SortBy?.ToLower() switch
        {
            "title" => filter.SortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "priority" => filter.SortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "status" => filter.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "duedate" => filter.SortDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            _ => filter.SortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var dtos = _mapper.Map<List<TicketDto>>(items);

        return new PaginatedList<TicketDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.Department)
            .Include(t => t.Requester)
            .Include(t => t.Assignee)
            .Include(t => t.Comments.OrderByDescending(c => c.CreatedAt)).ThenInclude(c => c.User)
            .Include(t => t.Comments).ThenInclude(c => c.Attachments)
            .Include(t => t.Attachments)
            .Include(t => t.History.OrderByDescending(h => h.Timestamp)).ThenInclude(h => h.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        return ticket == null ? null : _mapper.Map<TicketDetailDto>(ticket);
    }

    public async Task<TicketDto?> CreateTicketAsync(CreateTicketDto dto, string userId)
    {
        var ticketNumber = await GenerateTicketNumberAsync();

        var ticket = new Ticket
        {
            TicketNumber = ticketNumber,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = TicketStatus.Open,
            CategoryId = dto.CategoryId,
            DepartmentId = dto.DepartmentId,
            RequesterId = userId,
            DueDate = dto.DueDate,
            CreatedBy = userId
        };

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        // Add history entry
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = "created the ticket",
            Timestamp = DateTime.UtcNow
        };
        _context.TicketHistories.Add(history);
        await _context.SaveChangesAsync();

        // Send notifications
        try
        {
            await _notificationService.NotifyTicketCreatedAsync(
                ticket.Id,
                ticketNumber,
                dto.Title,
                userId,
                dto.DepartmentId.ToString());

            if (dto.Priority == TicketPriority.High || dto.Priority == TicketPriority.Critical)
            {
                await _notificationService.NotifyHighPriorityTicketAsync(
                    ticket.Id,
                    ticketNumber,
                    dto.Title,
                    dto.Priority.ToString());
            }
        }
        catch (Exception)
        {
            // Log error but don't fail the ticket creation
        }

        return await GetTicketDtoByIdAsync(ticket.Id);
    }

    public async Task<TicketDto?> UpdateTicketAsync(Guid id, UpdateTicketDto dto, string userId)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var oldPriority = ticket.Priority;

        ticket.Title = dto.Title;
        ticket.Description = dto.Description;
        ticket.Priority = dto.Priority;
        ticket.CategoryId = dto.CategoryId;
        ticket.DepartmentId = dto.DepartmentId;
        ticket.DueDate = dto.DueDate;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        // Add history entry
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = "updated the ticket",
            Timestamp = DateTime.UtcNow
        };
        _context.TicketHistories.Add(history);
        await _context.SaveChangesAsync();

        // Send notifications if priority increased
        try
        {
            if (dto.Priority != oldPriority &&
                (dto.Priority == TicketPriority.High || dto.Priority == TicketPriority.Critical))
            {
                await _notificationService.NotifyHighPriorityTicketAsync(
                    ticket.Id,
                    ticket.TicketNumber,
                    dto.Title,
                    dto.Priority.ToString());
            }
        }
        catch (Exception)
        {
            // Log error but don't fail the ticket update
        }

        return await GetTicketDtoByIdAsync(ticket.Id);
    }

    public async Task<bool> DeleteTicketAsync(Guid id)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return false;

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TicketDto?> UpdateTicketStatusAsync(Guid id, UpdateTicketStatusDto dto, string userId)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var oldStatus = ticket.Status.ToString();
        ticket.Status = dto.Status;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.UpdatedBy = userId;

        if (dto.Status == TicketStatus.Resolved)
            ticket.ResolvedAt = DateTime.UtcNow;
        else if (dto.Status == TicketStatus.Closed)
            ticket.ClosedAt = DateTime.UtcNow;

        // Add history entry
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = "changed status",
            OldValue = oldStatus,
            NewValue = dto.Status.ToString(),
            Timestamp = DateTime.UtcNow
        };
        _context.TicketHistories.Add(history);

        await _context.SaveChangesAsync();

        // Send notifications
        try
        {
            await _notificationService.NotifyTicketStatusChangedAsync(
                ticket.Id,
                ticket.TicketNumber,
                oldStatus,
                dto.Status.ToString(),
                ticket.RequesterId,
                ticket.AssigneeId);
        }
        catch (Exception)
        {
            // Log error but don't fail the status update
        }

        return await GetTicketDtoByIdAsync(ticket.Id);
    }

    public async Task<TicketDto?> AssignTicketAsync(Guid id, AssignTicketDto dto, string userId)
    {
        var ticket = await _context.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var oldAssignee = ticket.AssigneeId;
        ticket.AssigneeId = dto.AssigneeId;
        ticket.UpdatedAt = DateTime.UtcNow;
        ticket.UpdatedBy = userId;

        if (ticket.Status == TicketStatus.Open)
            ticket.Status = TicketStatus.InProgress;

        // Add history entry
        var history = new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = "assigned the ticket",
            OldValue = oldAssignee,
            NewValue = dto.AssigneeId,
            Timestamp = DateTime.UtcNow
        };
        _context.TicketHistories.Add(history);

        await _context.SaveChangesAsync();

        // Send notification to new assignee
        try
        {
            if (!string.IsNullOrEmpty(dto.AssigneeId))
            {
                var assigner = await _context.Users.FindAsync(userId);
                var assignerName = assigner?.FullName ?? "Someone";

                await _notificationService.NotifyTicketAssignedAsync(
                    ticket.Id,
                    ticket.TicketNumber,
                    ticket.Title,
                    dto.AssigneeId,
                    assignerName);
            }
        }
        catch (Exception)
        {
            // Log error but don't fail the assignment
        }

        return await GetTicketDtoByIdAsync(ticket.Id);
    }

    public async Task<CommentDto?> AddCommentAsync(Guid ticketId, CreateCommentDto dto, string userId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null) return null;

        var comment = new Comment
        {
            TicketId = ticketId,
            Content = dto.Content,
            IsInternal = dto.IsInternal,
            UserId = userId,
            CreatedBy = userId
        };

        _context.Comments.Add(comment);

        // Add history entry
        var history = new TicketHistory
        {
            TicketId = ticketId,
            UserId = userId,
            Action = dto.IsInternal ? "added an internal note" : "added a comment",
            Timestamp = DateTime.UtcNow
        };
        _context.TicketHistories.Add(history);

        await _context.SaveChangesAsync();

        // Send notification (only for non-internal comments)
        try
        {
            if (!dto.IsInternal)
            {
                var commenter = await _context.Users.FindAsync(userId);
                var commenterName = commenter?.FullName ?? "Someone";

                await _notificationService.NotifyTicketCommentedAsync(
                    ticketId,
                    ticket.TicketNumber,
                    commenterName,
                    ticket.RequesterId,
                    ticket.AssigneeId,
                    userId);
            }
        }
        catch (Exception)
        {
            // Log error but don't fail the comment creation
        }

        var savedComment = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Attachments)
            .FirstOrDefaultAsync(c => c.Id == comment.Id);

        return _mapper.Map<CommentDto>(savedComment);
    }

    public async Task<CommentDto?> UpdateCommentAsync(Guid ticketId, Guid commentId, UpdateCommentDto dto, string userId)
    {
        var comment = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Attachments)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.TicketId == ticketId);

        if (comment == null) return null;

        // Only the comment owner can edit
        if (comment.UserId != userId)
            return null;

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;
        comment.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return _mapper.Map<CommentDto>(comment);
    }

    public async Task<bool> DeleteCommentAsync(Guid ticketId, Guid commentId, string userId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.TicketId == ticketId);

        if (comment == null) return false;

        // Only the comment owner can delete (or admin - you can add role check here)
        if (comment.UserId != userId)
            return false;

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task<string> GenerateTicketNumberAsync()
    {
        var today = DateTime.UtcNow;
        var prefix = $"TKT-{today:yyyyMMdd}";

        var count = await _context.Tickets
            .CountAsync(t => t.TicketNumber.StartsWith(prefix));

        return $"{prefix}-{(count + 1):D4}";
    }

    private async Task<TicketDto?> GetTicketDtoByIdAsync(Guid id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.Department)
            .Include(t => t.Requester)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == id);

        return ticket == null ? null : _mapper.Map<TicketDto>(ticket);
    }
}