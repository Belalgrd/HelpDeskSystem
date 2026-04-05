using HelpDesk.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace HelpDesk.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public string FullName => $"{FirstName} {LastName}";

    public ICollection<Ticket> RequestedTickets { get; set; } = new List<Ticket>();
    public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}