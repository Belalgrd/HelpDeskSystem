namespace HelpDesk.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int ClosedTickets { get; set; }
    public int OverdueTickets { get; set; }
    public double AverageResolutionHours { get; set; }
    public int TicketsCreatedToday { get; set; }
    public int TicketsResolvedToday { get; set; }
    public List<TicketsByPriorityDto> TicketsByPriority { get; set; } = new();
    public List<TicketsByDepartmentDto> TicketsByDepartment { get; set; } = new();
    public List<TicketTrendDto> TicketTrend { get; set; } = new();
}

public class TicketsByPriorityDto
{
    public string Priority { get; set; } = string.Empty;
    public int Count { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class TicketsByDepartmentDto
{
    public string Department { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TicketTrendDto
{
    public string Date { get; set; } = string.Empty;
    public int Created { get; set; }
    public int Resolved { get; set; }
}

// NEW: Agent Performance DTOs
public class AgentPerformanceDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public int AssignedTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int ClosedTickets { get; set; }
    public int OpenTickets { get; set; }
    public double AvgResolutionTimeHours { get; set; }
    public double SlaCompliancePercent { get; set; }
}

public class AgentPerformanceReportDto
{
    public List<AgentPerformanceDto> Agents { get; set; } = new();
    public AgentPerformanceSummaryDto Summary { get; set; } = new();
}

public class AgentPerformanceSummaryDto
{
    public int TotalAgents { get; set; }
    public double AvgResolvedPerAgent { get; set; }
    public double AvgResolutionTimeHours { get; set; }
    public double OverallSlaCompliancePercent { get; set; }
}