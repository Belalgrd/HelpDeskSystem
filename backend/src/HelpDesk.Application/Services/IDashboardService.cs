using HelpDesk.Application.DTOs.Dashboard;
using HelpDesk.Application.DTOs.Tickets;

namespace HelpDesk.Application.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync(string? period = "week");
    Task<List<TicketDto>> GetRecentTicketsAsync(int count = 5);
    Task<AgentPerformanceReportDto> GetAgentPerformanceAsync(string? period = "week");
}