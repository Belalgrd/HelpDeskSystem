using AutoMapper;
using HelpDesk.Application.Common.Interfaces;
using HelpDesk.Application.DTOs.Dashboard;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Application.Services;
using HelpDesk.Domain.Entities;
using HelpDesk.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardService(
        IApplicationDbContext context,
        IMapper mapper,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(string? period = "week")
    {
        var today = DateTime.UtcNow.Date;
        var startDate = period switch
        {
            "today" => today,
            "week" => today.AddDays(-7),
            "month" => today.AddMonths(-1),
            "year" => today.AddYears(-1),
            _ => today.AddDays(-7)
        };

        var allTickets = await _context.Tickets.ToListAsync();

        // Calculate average resolution time
        var resolvedTickets = allTickets.Where(t => t.ResolvedAt.HasValue).ToList();
        var avgResolutionHours = resolvedTickets.Any()
            ? resolvedTickets.Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours)
            : 0;

        var stats = new DashboardStatsDto
        {
            TotalTickets = allTickets.Count,
            OpenTickets = allTickets.Count(t => t.Status == TicketStatus.Open),
            InProgressTickets = allTickets.Count(t => t.Status == TicketStatus.InProgress),
            ResolvedTickets = allTickets.Count(t => t.Status == TicketStatus.Resolved),
            ClosedTickets = allTickets.Count(t => t.Status == TicketStatus.Closed),
            OverdueTickets = allTickets.Count(t => t.DueDate < DateTime.UtcNow &&
                                                    t.Status != TicketStatus.Closed &&
                                                    t.Status != TicketStatus.Resolved),
            TicketsCreatedToday = allTickets.Count(t => t.CreatedAt.Date == today),
            TicketsResolvedToday = allTickets.Count(t => t.ResolvedAt?.Date == today),
            AverageResolutionHours = Math.Round(avgResolutionHours, 1),

            TicketsByPriority = new List<TicketsByPriorityDto>
            {
                new() { Priority = "Critical", Count = allTickets.Count(t => t.Priority == TicketPriority.Critical), Color = "#ef4444" },
                new() { Priority = "High", Count = allTickets.Count(t => t.Priority == TicketPriority.High), Color = "#f97316" },
                new() { Priority = "Medium", Count = allTickets.Count(t => t.Priority == TicketPriority.Medium), Color = "#3b82f6" },
                new() { Priority = "Low", Count = allTickets.Count(t => t.Priority == TicketPriority.Low), Color = "#6b7280" }
            }
        };

        // Tickets by Department
        var departments = await _context.Departments.ToListAsync();
        stats.TicketsByDepartment = departments.Select(d => new TicketsByDepartmentDto
        {
            Department = d.Name,
            Count = allTickets.Count(t => t.DepartmentId == d.Id)
        }).Where(x => x.Count > 0).ToList();

        // Ticket Trend (last 7 days or based on period)
        var trendDays = period switch
        {
            "today" => 1,
            "week" => 7,
            "month" => 30,
            "year" => 12, // Monthly for year
            _ => 7
        };

        if (period == "year")
        {
            // Monthly trend for year
            stats.TicketTrend = Enumerable.Range(0, 12)
                .Select(i => today.AddMonths(-11 + i))
                .Select(date => new TicketTrendDto
                {
                    Date = date.ToString("MMM yyyy"),
                    Created = allTickets.Count(t => t.CreatedAt.Year == date.Year && t.CreatedAt.Month == date.Month),
                    Resolved = allTickets.Count(t => t.ResolvedAt?.Year == date.Year && t.ResolvedAt?.Month == date.Month)
                }).ToList();
        }
        else
        {
            stats.TicketTrend = Enumerable.Range(0, trendDays)
                .Select(i => today.AddDays(-(trendDays - 1) + i))
                .Select(date => new TicketTrendDto
                {
                    Date = date.ToString("MMM dd"),
                    Created = allTickets.Count(t => t.CreatedAt.Date == date),
                    Resolved = allTickets.Count(t => t.ResolvedAt?.Date == date)
                }).ToList();
        }

        return stats;
    }

    public async Task<List<TicketDto>> GetRecentTicketsAsync(int count = 5)
    {
        var tickets = await _context.Tickets
            .Include(t => t.Category)
            .Include(t => t.Department)
            .Include(t => t.Requester)
            .Include(t => t.Assignee)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .OrderByDescending(t => t.CreatedAt)
            .Take(count)
            .ToListAsync();

        return _mapper.Map<List<TicketDto>>(tickets);
    }

    public async Task<AgentPerformanceReportDto> GetAgentPerformanceAsync(string? period = "week")
    {
        var today = DateTime.UtcNow.Date;
        var startDate = period switch
        {
            "today" => today,
            "week" => today.AddDays(-7),
            "month" => today.AddMonths(-1),
            "year" => today.AddYears(-1),
            _ => today.AddDays(-7)
        };

        // Get all agents (Agent, Supervisor, Admin roles)
        var agents = await _userManager.Users
            .Include(u => u.Department)
            .Where(u => u.IsActive &&
                       (u.Role == UserRole.Agent || u.Role == UserRole.Supervisor || u.Role == UserRole.Admin))
            .ToListAsync();

        // Get all tickets with assignee
        var allTickets = await _context.Tickets
            .Where(t => t.AssigneeId != null)
            .ToListAsync();

        // Filter by period for statistics
        var periodTickets = allTickets.Where(t => t.CreatedAt >= startDate).ToList();

        var agentPerformance = new List<AgentPerformanceDto>();

        foreach (var agent in agents)
        {
            var agentTickets = periodTickets.Where(t => t.AssigneeId == agent.Id).ToList();
            var resolvedTickets = agentTickets.Where(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Closed).ToList();
            var ticketsWithResolutionTime = agentTickets.Where(t => t.ResolvedAt.HasValue).ToList();

            // Calculate average resolution time
            var avgResolutionTime = ticketsWithResolutionTime.Any()
                ? ticketsWithResolutionTime.Average(t => (t.ResolvedAt!.Value - t.CreatedAt).TotalHours)
                : 0;

            // Calculate SLA compliance (tickets resolved before due date)
            var ticketsWithDueDate = agentTickets.Where(t => t.DueDate.HasValue).ToList();
            var ticketsOnTime = ticketsWithDueDate.Count(t =>
                (t.ResolvedAt.HasValue && t.ResolvedAt <= t.DueDate) ||
                (!t.ResolvedAt.HasValue && t.Status != TicketStatus.Closed && t.Status != TicketStatus.Resolved && DateTime.UtcNow <= t.DueDate));

            var slaCompliance = ticketsWithDueDate.Any()
                ? (double)ticketsOnTime / ticketsWithDueDate.Count * 100
                : 100;

            agentPerformance.Add(new AgentPerformanceDto
            {
                Id = agent.Id,
                Name = agent.FullName,
                Email = agent.Email ?? "",
                DepartmentName = agent.Department?.Name,
                AssignedTickets = agentTickets.Count,
                ResolvedTickets = agentTickets.Count(t => t.Status == TicketStatus.Resolved),
                ClosedTickets = agentTickets.Count(t => t.Status == TicketStatus.Closed),
                OpenTickets = agentTickets.Count(t => t.Status == TicketStatus.Open || t.Status == TicketStatus.InProgress),
                AvgResolutionTimeHours = Math.Round(avgResolutionTime, 1),
                SlaCompliancePercent = Math.Round(slaCompliance, 1)
            });
        }

        // Calculate summary
        var totalResolved = agentPerformance.Sum(a => a.ResolvedTickets + a.ClosedTickets);
        var avgResolvedPerAgent = agents.Any() ? (double)totalResolved / agents.Count : 0;
        var overallAvgResolutionTime = agentPerformance.Where(a => a.AvgResolutionTimeHours > 0).Any()
            ? agentPerformance.Where(a => a.AvgResolutionTimeHours > 0).Average(a => a.AvgResolutionTimeHours)
            : 0;
        var overallSla = agentPerformance.Any()
            ? agentPerformance.Average(a => a.SlaCompliancePercent)
            : 100;

        return new AgentPerformanceReportDto
        {
            Agents = agentPerformance.OrderByDescending(a => a.ResolvedTickets + a.ClosedTickets).ToList(),
            Summary = new AgentPerformanceSummaryDto
            {
                TotalAgents = agents.Count,
                AvgResolvedPerAgent = Math.Round(avgResolvedPerAgent, 1),
                AvgResolutionTimeHours = Math.Round(overallAvgResolutionTime, 1),
                OverallSlaCompliancePercent = Math.Round(overallSla, 1)
            }
        };
    }
}