import React, { useState, useMemo, useRef } from 'react';
import {
    HiChartBar,
    HiTrendingUp,
    HiTrendingDown,
    HiClock,
    HiTicket,
    HiCheckCircle,
    HiExclamationCircle,
    HiDownload,
    HiRefresh,
    HiUserGroup,
    HiShieldCheck,
} from 'react-icons/hi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { Loading } from '../../components/common/Loading';
import { useDashboardStats, useAgentPerformance } from '../../hooks/useDashboard';
import type { AgentPerformance } from '../../types/common.types';

// Period options
const PERIOD_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' },
];

// Status colors for pie chart
const STATUS_COLORS: Record<string, string> = {
    Open: '#3B82F6',
    'In Progress': '#F59E0B',
    Resolved: '#10B981',
    Closed: '#6B7280',
    Pending: '#8B5CF6',
};

// Tab options
const TAB_OPTIONS = [
    { value: 'overview', label: 'Overview', icon: HiChartBar },
    { value: 'agents', label: 'Agent Performance', icon: HiUserGroup },
    { value: 'sla', label: 'SLA Metrics', icon: HiShieldCheck },
];

// Custom Tooltip Component for proper styling
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                {label && <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>}
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom Pie Tooltip
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.name}: {data.value}
                </p>
            </div>
        );
    }
    return null;
};

export const Reports: React.FC = () => {
    const [period, setPeriod] = useState('week');
    const [activeTab, setActiveTab] = useState('overview');
    const reportRef = useRef<HTMLDivElement>(null);

    const { data: response, isLoading, refetch, isFetching } = useDashboardStats(period);
    const { data: agentResponse, isLoading: agentLoading } = useAgentPerformance(period);

    const stats = response?.data;
    const agentReport = agentResponse?.data;

    // Calculate resolution rate
    const resolutionRate = stats
        ? Math.round(((stats.resolvedTickets + stats.closedTickets) / Math.max(stats.totalTickets, 1)) * 100)
        : 0;

    // Calculate SLA metrics
    const slaMetrics = useMemo(() => {
        if (!stats) return null;
        return {
            avgFirstResponseTime: 2.5,
            avgResolutionTime: stats.averageResolutionHours,
            slaCompliance: Math.max(0, 100 - (stats.overdueTickets / Math.max(stats.totalTickets, 1)) * 100),
            breachedTickets: stats.overdueTickets,
            onTrackTickets: stats.totalTickets - stats.overdueTickets,
        };
    }, [stats]);

    // Prepare status data for pie chart
    const statusData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Open', value: stats.openTickets, color: STATUS_COLORS.Open },
            { name: 'In Progress', value: stats.inProgressTickets, color: STATUS_COLORS['In Progress'] },
            { name: 'Resolved', value: stats.resolvedTickets, color: STATUS_COLORS.Resolved },
            { name: 'Closed', value: stats.closedTickets, color: STATUS_COLORS.Closed },
        ].filter(item => item.value > 0);
    }, [stats]);

    // Export to CSV
    const exportToCSV = () => {
        if (!stats) return;

        const csvData = [
            ['HelpDesk Report'],
            ['Generated', new Date().toLocaleString()],
            ['Period', PERIOD_OPTIONS.find(p => p.value === period)?.label || period],
            [''],
            ['TICKET SUMMARY'],
            ['Metric', 'Value', 'Percentage'],
            ['Total Tickets', stats.totalTickets.toString(), '100%'],
            ['Open Tickets', stats.openTickets.toString(), `${((stats.openTickets / Math.max(stats.totalTickets, 1)) * 100).toFixed(1)}%`],
            ['In Progress', stats.inProgressTickets.toString(), `${((stats.inProgressTickets / Math.max(stats.totalTickets, 1)) * 100).toFixed(1)}%`],
            ['Resolved', stats.resolvedTickets.toString(), `${((stats.resolvedTickets / Math.max(stats.totalTickets, 1)) * 100).toFixed(1)}%`],
            ['Closed', stats.closedTickets.toString(), `${((stats.closedTickets / Math.max(stats.totalTickets, 1)) * 100).toFixed(1)}%`],
            ['Overdue', stats.overdueTickets.toString(), ''],
            [''],
            ['PERFORMANCE METRICS'],
            ['Avg Resolution Time', `${stats.averageResolutionHours} hours`],
            ['Resolution Rate', `${resolutionRate}%`],
            [''],
            ['TICKETS BY PRIORITY'],
            ['Priority', 'Count'],
            ...stats.ticketsByPriority.map(p => [p.priority, p.count.toString()]),
            [''],
            ['TICKETS BY DEPARTMENT'],
            ['Department', 'Count'],
            ...stats.ticketsByDepartment.map(d => [d.department, d.count.toString()]),
        ];

        // Add agent performance if available
        if (agentReport?.agents && agentReport.agents.length > 0) {
            csvData.push(['']);
            csvData.push(['AGENT PERFORMANCE']);
            csvData.push(['Agent', 'Department', 'Assigned', 'Resolved', 'Avg Time (hrs)', 'SLA %']);
            agentReport.agents.forEach(agent => {
                csvData.push([
                    agent.name,
                    agent.departmentName || 'Unassigned',
                    agent.assignedTickets.toString(),
                    (agent.resolvedTickets + agent.closedTickets).toString(),
                    agent.avgResolutionTimeHours.toString(),
                    `${agent.slaCompliancePercent}%`
                ]);
            });
        }

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `helpdesk-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Export to PDF (print-friendly)
    const exportToPDF = () => {
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>HelpDesk Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                    h2 { color: #374151; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
                    th { background-color: #f3f4f6; font-weight: bold; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; text-align: center; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
                    .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
                    .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <h1>HelpDesk Analytics Report</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Period:</strong> ${PERIOD_OPTIONS.find(p => p.value === period)?.label || period}</p>
                
                <h2>Ticket Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats?.totalTickets || 0}</div>
                        <div class="stat-label">Total Tickets</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${resolutionRate}%</div>
                        <div class="stat-label">Resolution Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats?.averageResolutionHours || 0}h</div>
                        <div class="stat-label">Avg Resolution Time</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats?.overdueTickets || 0}</div>
                        <div class="stat-label">Overdue Tickets</div>
                    </div>
                </div>

                <h2>Tickets by Status</h2>
                <table>
                    <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
                    <tr><td>Open</td><td>${stats?.openTickets || 0}</td><td>${((stats?.openTickets || 0) / Math.max(stats?.totalTickets || 1, 1) * 100).toFixed(1)}%</td></tr>
                    <tr><td>In Progress</td><td>${stats?.inProgressTickets || 0}</td><td>${((stats?.inProgressTickets || 0) / Math.max(stats?.totalTickets || 1, 1) * 100).toFixed(1)}%</td></tr>
                    <tr><td>Resolved</td><td>${stats?.resolvedTickets || 0}</td><td>${((stats?.resolvedTickets || 0) / Math.max(stats?.totalTickets || 1, 1) * 100).toFixed(1)}%</td></tr>
                    <tr><td>Closed</td><td>${stats?.closedTickets || 0}</td><td>${((stats?.closedTickets || 0) / Math.max(stats?.totalTickets || 1, 1) * 100).toFixed(1)}%</td></tr>
                </table>

                <h2>Tickets by Priority</h2>
                <table>
                    <tr><th>Priority</th><th>Count</th></tr>
                    ${stats?.ticketsByPriority.map(p => `<tr><td>${p.priority}</td><td>${p.count}</td></tr>`).join('') || ''}
                </table>

                <h2>Tickets by Department</h2>
                <table>
                    <tr><th>Department</th><th>Count</th></tr>
                    ${stats?.ticketsByDepartment.map(d => `<tr><td>${d.department}</td><td>${d.count}</td></tr>`).join('') || ''}
                </table>

                ${agentReport?.agents && agentReport.agents.length > 0 ? `
                <h2>Agent Performance</h2>
                <table>
                    <tr><th>Agent</th><th>Department</th><th>Assigned</th><th>Resolved</th><th>Avg Time</th><th>SLA %</th></tr>
                    ${agentReport.agents.map(a => `
                        <tr>
                            <td>${a.name}</td>
                            <td>${a.departmentName || 'Unassigned'}</td>
                            <td>${a.assignedTickets}</td>
                            <td>${a.resolvedTickets + a.closedTickets}</td>
                            <td>${a.avgResolutionTimeHours}h</td>
                            <td>${a.slaCompliancePercent}%</td>
                        </tr>
                    `).join('')}
                </table>
                ` : ''}

                <div class="footer">
                    <p>Generated by HelpDesk System</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    // Handle export
    const handleExport = (type: 'pdf' | 'excel') => {
        if (type === 'excel') {
            exportToCSV();
        } else {
            exportToPDF();
        }
    };

    return (
        <div className="space-y-6" ref={reportRef}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        Reports & Analytics
                    </h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Comprehensive insights into your helpdesk performance
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Period Selector */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                        {PERIOD_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setPeriod(option.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${period === option.value
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh data"
                    >
                        <HiRefresh className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <HiDownload className="w-4 h-4" />
                            Export
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                            >
                                Export as PDF
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                            >
                                Export as CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex gap-4">
                    {TAB_OPTIONS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.value
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loading size="lg" />
                </div>
            ) : stats ? (
                <>
                    {activeTab === 'overview' && (
                        <OverviewTab
                            stats={stats}
                            resolutionRate={resolutionRate}
                            statusData={statusData}
                        />
                    )}
                    {activeTab === 'agents' && (
                        <AgentPerformanceTab
                            report={agentReport}
                            isLoading={agentLoading}
                        />
                    )}
                    {activeTab === 'sla' && slaMetrics && (
                        <SLAMetricsTab metrics={slaMetrics} stats={stats} />
                    )}
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <HiChartBar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
                    <p className="text-gray-500 dark:text-gray-400">There's no report data to display for the selected period.</p>
                </div>
            )}
        </div>
    );
};

// ==================== OVERVIEW TAB ====================
interface OverviewTabProps {
    stats: {
        totalTickets: number;
        openTickets: number;
        inProgressTickets: number;
        resolvedTickets: number;
        closedTickets: number;
        overdueTickets: number;
        averageResolutionHours: number;
        ticketsCreatedToday: number;
        ticketsResolvedToday: number;
        ticketsByPriority: { priority: string; count: number; color: string }[];
        ticketsByDepartment: { department: string; count: number }[];
        ticketTrend: { date: string; created: number; resolved: number }[];
    };
    resolutionRate: number;
    statusData: { name: string; value: number; color: string }[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, resolutionRate, statusData }) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Tickets" value={stats.totalTickets} icon={<HiTicket className="w-6 h-6" />} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" subtitle={`${stats.ticketsCreatedToday} created today`} />
                <StatsCard title="Resolution Rate" value={`${resolutionRate}%`} icon={<HiCheckCircle className="w-6 h-6" />} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" subtitle={`${stats.resolvedTickets + stats.closedTickets} resolved`} trend={resolutionRate >= 80 ? 'up' : 'down'} />
                <StatsCard title="Avg Resolution Time" value={`${stats.averageResolutionHours}h`} icon={<HiClock className="w-6 h-6" />} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" subtitle={`${stats.ticketsResolvedToday} resolved today`} />
                <StatsCard title="Overdue Tickets" value={stats.overdueTickets} icon={<HiExclamationCircle className="w-6 h-6" />} iconBg={stats.overdueTickets > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-900/30"} iconColor={stats.overdueTickets > 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"} subtitle={stats.overdueTickets > 0 ? "Requires attention" : "All on track"} trend={stats.overdueTickets > 0 ? 'down' : 'up'} />
            </div>

            {/* Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Trends</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tickets created vs resolved over time</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-600 dark:text-gray-400">Created</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600 dark:text-gray-400">Resolved</span></div>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.ticketTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="created" name="Created" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status & Priority Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Status</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Distribution across all statuses</p>
                    </div>
                    <div className="h-64">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                        {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {statusData.map((item) => (<div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span></div>))}
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Priority</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Distribution by priority level</p>
                    </div>
                    <div className="h-64">
                        {stats.ticketsByPriority.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.ticketsByPriority} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                    <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <YAxis type="category" dataKey="priority" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                                        {stats.ticketsByPriority.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Department Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Department</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Distribution across departments</p>
                </div>
                <div className="h-80">
                    {stats.ticketsByDepartment.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.ticketsByDepartment}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="department" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Tickets" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                    )}
                </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Summary</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Key metrics at a glance</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metric</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[
                                { name: 'Open Tickets', value: stats.openTickets, color: 'bg-blue-500' },
                                { name: 'In Progress', value: stats.inProgressTickets, color: 'bg-amber-500' },
                                { name: 'Resolved', value: stats.resolvedTickets, color: 'bg-green-500' },
                                { name: 'Closed', value: stats.closedTickets, color: 'bg-gray-500' },
                            ].map((item) => (
                                <tr key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${item.color}`} />{item.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">{item.value}</td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">{stats.totalTickets > 0 ? ((item.value / stats.totalTickets) * 100).toFixed(1) : 0}%</td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">{stats.totalTickets}</td>
                                <td className="px-6 py-4 text-sm text-right font-bold text-gray-500 dark:text-gray-400">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==================== AGENT PERFORMANCE TAB ====================
interface AgentPerformanceTabProps {
    report?: {
        agents: AgentPerformance[];
        summary: {
            totalAgents: number;
            avgResolvedPerAgent: number;
            avgResolutionTimeHours: number;
            overallSlaCompliancePercent: number;
        };
    };
    isLoading: boolean;
}

const AgentPerformanceTab: React.FC<AgentPerformanceTabProps> = ({ report, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center py-12"><Loading size="lg" /></div>;
    }

    const agents = report?.agents || [];
    const summary = report?.summary;

    return (
        <div className="space-y-6">
            {/* Team Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard title="Total Agents" value={summary.totalAgents} icon={<HiUserGroup className="w-6 h-6" />} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" subtitle="Active support agents" />
                    <StatsCard title="Avg Resolved/Agent" value={summary.avgResolvedPerAgent} icon={<HiCheckCircle className="w-6 h-6" />} iconBg="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" subtitle="Tickets per agent" />
                    <StatsCard title="Avg Resolution Time" value={`${summary.avgResolutionTimeHours}h`} icon={<HiClock className="w-6 h-6" />} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" subtitle="Team average" />
                    <StatsCard title="Team SLA Compliance" value={`${summary.overallSlaCompliancePercent}%`} icon={<HiShieldCheck className="w-6 h-6" />} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400" subtitle="Average compliance" trend={summary.overallSlaCompliancePercent >= 90 ? 'up' : 'down'} />
                </div>
            )}

            {/* Agent Performance Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Performance</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Individual agent metrics and performance indicators</p>
                </div>
                {agents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolved</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Time</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SLA %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600  dark:text-primary-400 font-medium">
                                                    {agent.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{agent.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{agent.departmentName || 'Unassigned'}</td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">{agent.assignedTickets}</td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="text-green-600 dark:text-green-400 font-medium">{agent.resolvedTickets + agent.closedTickets}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="text-amber-600 dark:text-amber-400">{agent.openTickets}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">{agent.avgResolutionTimeHours}h</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${agent.slaCompliancePercent >= 90
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : agent.slaCompliancePercent >= 75
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {agent.slaCompliancePercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <HiUserGroup className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No agents found</p>
                    </div>
                )}
            </div>

            {/* Performance Chart */}
            {agents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Agent</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned vs Resolved comparison</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agents.slice(0, 10).map(a => ({ ...a, totalResolved: a.resolvedTickets + a.closedTickets }))} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                                <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={120} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="assignedTickets" name="Assigned" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="totalResolved" name="Resolved" fill="#10B981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== SLA METRICS TAB ====================
interface SLAMetrics {
    avgFirstResponseTime: number;
    avgResolutionTime: number;
    slaCompliance: number;
    breachedTickets: number;
    onTrackTickets: number;
}

interface SLAMetricsTabProps {
    metrics: SLAMetrics;
    stats: {
        totalTickets: number;
        ticketsByPriority: { priority: string; count: number; color: string }[];
    };
}

const SLAMetricsTab: React.FC<SLAMetricsTabProps> = ({ metrics, stats }) => {
    // SLA data for pie chart
    const slaData = useMemo(() => {
        return [
            { name: 'On Track', value: metrics.onTrackTickets, color: '#10B981' },
            { name: 'Breached', value: metrics.breachedTickets, color: '#EF4444' },
        ].filter(item => item.value > 0);
    }, [metrics]);

    // SLA targets by priority
    const slaTargets = [
        { priority: 'Critical', responseTarget: '1h', resolutionTarget: '4h', color: '#ef4444' },
        { priority: 'High', responseTarget: '2h', resolutionTarget: '8h', color: '#f97316' },
        { priority: 'Medium', responseTarget: '4h', resolutionTarget: '24h', color: '#3b82f6' },
        { priority: 'Low', responseTarget: '8h', resolutionTarget: '48h', color: '#6b7280' },
    ];

    return (
        <div className="space-y-6">
            {/* SLA Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="SLA Compliance"
                    value={`${metrics.slaCompliance.toFixed(1)}%`}
                    icon={<HiShieldCheck className="w-6 h-6" />}
                    iconBg={metrics.slaCompliance >= 90 ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}
                    iconColor={metrics.slaCompliance >= 90 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}
                    subtitle={metrics.slaCompliance >= 90 ? "Excellent" : "Needs improvement"}
                    trend={metrics.slaCompliance >= 90 ? 'up' : 'down'}
                />
                <StatsCard
                    title="Avg First Response"
                    value={`${metrics.avgFirstResponseTime}h`}
                    icon={<HiClock className="w-6 h-6" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                    subtitle="Time to first response"
                />
                <StatsCard
                    title="Avg Resolution Time"
                    value={`${metrics.avgResolutionTime}h`}
                    icon={<HiClock className="w-6 h-6" />}
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    iconColor="text-purple-600 dark:text-purple-400"
                    subtitle="Time to resolution"
                />
                <StatsCard
                    title="SLA Breaches"
                    value={metrics.breachedTickets}
                    icon={<HiExclamationCircle className="w-6 h-6" />}
                    iconBg={metrics.breachedTickets > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-900/30"}
                    iconColor={metrics.breachedTickets > 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}
                    subtitle={metrics.breachedTickets > 0 ? "Overdue tickets" : "All within SLA"}
                    trend={metrics.breachedTickets > 0 ? 'down' : 'up'}
                />
            </div>

            {/* SLA Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SLA Compliance Pie */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SLA Compliance Breakdown</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">On track vs breached tickets</p>
                    </div>
                    <div className="h-64">
                        {slaData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={slaData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {slaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">No data available</div>
                        )}
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {slaData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SLA Progress Bars */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SLA Performance</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Performance against targets</p>
                    </div>
                    <div className="space-y-6">
                        {/* First Response SLA */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First Response Time</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.avgFirstResponseTime}h avg</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min((4 / Math.max(metrics.avgFirstResponseTime, 0.1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Resolution Time SLA */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolution Time</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.avgResolutionTime}h avg</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className="bg-purple-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min((24 / Math.max(metrics.avgResolutionTime, 0.1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Overall SLA Compliance */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Compliance</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{metrics.slaCompliance.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${metrics.slaCompliance >= 90 ? 'bg-green-500' : metrics.slaCompliance >= 75 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${metrics.slaCompliance}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLA Targets Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SLA Targets by Priority</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target response and resolution times</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tickets</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Response Target</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolution Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {slaTargets.map((target) => {
                                const priorityData = stats.ticketsByPriority.find(p => p.priority === target.priority);
                                return (
                                    <tr key={target.priority} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: target.color }} />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{target.priority}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-white">
                                            {priorityData?.count || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">{target.responseTarget}</td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">{target.resolutionTarget}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ==================== STATS CARD COMPONENT ====================
interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    subtitle?: string;
    trend?: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, iconBg, iconColor, subtitle, trend }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <span className={iconColor}>{icon}</span>
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        {trend === 'up' ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
};