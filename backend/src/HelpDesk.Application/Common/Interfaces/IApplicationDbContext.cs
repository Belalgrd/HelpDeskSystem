using HelpDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Ticket> Tickets { get; }
    DbSet<Department> Departments { get; }
    DbSet<Category> Categories { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Attachment> Attachments { get; }
    DbSet<TicketHistory> TicketHistories { get; }
    DbSet<ApplicationUser> Users { get; }
    DbSet<Notification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}