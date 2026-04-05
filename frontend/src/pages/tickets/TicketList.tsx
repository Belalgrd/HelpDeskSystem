import React, { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { HiPlus, HiViewGrid, HiViewList, HiX } from 'react-icons/hi';
import { Button } from '../../components/common/Button';
import { PageLoading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '../../components/tickets/TicketPriorityBadge';
import { useTickets } from '../../hooks/useTickets';
import type { TicketFilter, TicketStatus, TicketPriority } from '../../types/ticket.types';
import { formatRelativeTime, cn } from '../../utils/helpers';

type ViewMode = 'grid' | 'list';

export const TicketList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Derive filter from URL parameters using useMemo (not useEffect + setState)
    const filter = useMemo<TicketFilter>(() => {
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const page = searchParams.get('page');
        const sortBy = searchParams.get('sortBy');
        const sortDesc = searchParams.get('sortDesc');
        const categoryId = searchParams.get('categoryId');
        const departmentId = searchParams.get('departmentId');

        return {
            pageNumber: page ? parseInt(page) : 1,
            pageSize: 12,
            sortBy: sortBy || 'CreatedAt',
            sortDescending: sortDesc !== 'false',
            searchTerm: search || undefined,
            status: (status as TicketStatus) || undefined,
            priority: (priority as TicketPriority) || undefined,
            categoryId: categoryId || undefined,
            departmentId: departmentId || undefined,
        };
    }, [searchParams]);

    // Update URL parameters
    const updateUrlParams = useCallback((newFilter: TicketFilter) => {
        const params = new URLSearchParams();

        if (newFilter.searchTerm) params.set('search', newFilter.searchTerm);
        if (newFilter.status) params.set('status', newFilter.status);
        if (newFilter.priority) params.set('priority', newFilter.priority);
        if (newFilter.categoryId) params.set('categoryId', newFilter.categoryId);
        if (newFilter.departmentId) params.set('departmentId', newFilter.departmentId);
        if (newFilter.pageNumber && newFilter.pageNumber > 1) {
            params.set('page', newFilter.pageNumber.toString());
        }
        if (newFilter.sortBy && newFilter.sortBy !== 'CreatedAt') {
            params.set('sortBy', newFilter.sortBy);
        }
        if (newFilter.sortDescending === false) {
            params.set('sortDesc', 'false');
        }

        setSearchParams(params, { replace: true });
    }, [setSearchParams]);

    // Handle filter changes from TicketFilters component
    const handleFilterChange = useCallback((newFilter: TicketFilter) => {
        updateUrlParams({ ...newFilter, pageNumber: 1 });
    }, [updateUrlParams]);

    // Handle page changes
    const handlePageChange = useCallback((page: number) => {
        updateUrlParams({ ...filter, pageNumber: page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filter, updateUrlParams]);

    // Clear search
    const clearSearch = useCallback(() => {
        updateUrlParams({ ...filter, searchTerm: undefined, pageNumber: 1 });
    }, [filter, updateUrlParams]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    const { data: response, isLoading } = useTickets(filter);

    const tickets = response?.data?.items || [];
    const totalPages = response?.data?.totalPages || 1;
    const totalCount = response?.data?.totalCount || 0;

    const hasActiveFilters = filter.searchTerm || filter.status || filter.priority || filter.categoryId || filter.departmentId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Tickets</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Manage and track all support tickets ({totalCount} total)
                    </p>
                </div>
                <Link to="/tickets/create">
                    <Button leftIcon={<HiPlus className="w-4 h-4" />}>New Ticket</Button>
                </Link>
            </div>

            {/* Active Search Banner */}
            {filter.searchTerm && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-primary-700 dark:text-primary-300">
                            Searching for: <strong className="font-semibold">"{filter.searchTerm}"</strong>
                        </span>
                        <span className="text-sm text-primary-600 dark:text-primary-400">
                            ({totalCount} {totalCount === 1 ? 'result' : 'results'})
                        </span>
                    </div>
                    <button
                        onClick={clearSearch}
                        className="p-1.5 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800/50 transition-colors"
                        title="Clear search"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Filters */}
            <TicketFilters filter={filter} onFilterChange={handleFilterChange} />

            {/* View Toggle and Results */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {tickets.length} of {totalCount} tickets
                </p>
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            'p-2 rounded-md transition-colors',
                            viewMode === 'grid'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                        title="Grid view"
                    >
                        <HiViewGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'p-2 rounded-md transition-colors',
                            viewMode === 'list'
                                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        )}
                        title="List view"
                    >
                        <HiViewList className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoading />
            ) : tickets.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <HiViewList className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No tickets found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {hasActiveFilters
                            ? 'Try adjusting your filters or search term'
                            : 'Get started by creating your first ticket'}
                    </p>
                    {hasActiveFilters ? (
                        <Button variant="secondary" onClick={clearAllFilters}>
                            Clear all filters
                        </Button>
                    ) : (
                        <Link to="/tickets/create">
                            <Button leftIcon={<HiPlus className="w-4 h-4" />}>Create Ticket</Button>
                        </Link>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Ticket
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Assignee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {ticket.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {ticket.ticketNumber}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <TicketStatusBadge status={ticket.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <TicketPriorityBadge priority={ticket.priority} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {ticket.assigneeName || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatRelativeTime(ticket.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-gray-400">→</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={filter.pageNumber || 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};