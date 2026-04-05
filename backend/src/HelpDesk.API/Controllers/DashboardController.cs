using HelpDesk.Application.Common.Models;
using HelpDesk.Application.DTOs.Dashboard;
using HelpDesk.Application.DTOs.Tickets;
using HelpDesk.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats([FromQuery] string? period = "week")
    {
        var stats = await _dashboardService.GetDashboardStatsAsync(period);
        return Ok(ApiResponse<DashboardStatsDto>.SuccessResponse(stats));
    }

    [HttpGet("recent-tickets")]
    public async Task<ActionResult<ApiResponse<List<TicketDto>>>> GetRecentTickets([FromQuery] int count = 5)
    {
        var tickets = await _dashboardService.GetRecentTicketsAsync(count);
        return Ok(ApiResponse<List<TicketDto>>.SuccessResponse(tickets));
    }

    [HttpGet("agent-performance")]
    public async Task<ActionResult<ApiResponse<AgentPerformanceReportDto>>> GetAgentPerformance([FromQuery] string? period = "week")
    {
        var report = await _dashboardService.GetAgentPerformanceAsync(period);
        return Ok(ApiResponse<AgentPerformanceReportDto>.SuccessResponse(report));
    }
}