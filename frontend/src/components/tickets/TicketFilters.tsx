import React from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { TicketFilter, TicketStatus, TicketPriority } from '../../types/ticket.types';
import { TICKET_STATUSES, TICKET_PRIORITIES, SORT_OPTIONS } from '../../utils/constants';
import { useDepartments, useCategories } from '../../hooks/useCommon';

interface TicketFiltersProps {
    filter: TicketFilter;
    onFilterChange: (filter: TicketFilter) => void;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({ filter, onFilterChange }) => {
    const { data: departmentsResponse } = useDepartments();
    const { data: categoriesResponse } = useCategories();

    const departments = departmentsResponse?.data || [];
    const categories = categoriesResponse?.data || [];

    const hasActiveFilters = filter.status || filter.priority || filter.categoryId || filter.departmentId;

    const clearFilters = () => {
        onFilterChange({
            ...filter,
            status: undefined,
            priority: undefined,
            categoryId: undefined,
            departmentId: undefined,
            searchTerm: undefined,
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <Input
                        placeholder="Search tickets..."
                        value={filter.searchTerm || ''}
                        onChange={(e) => onFilterChange({ ...filter, searchTerm: e.target.value, pageNumber: 1 })}
                        leftIcon={<HiSearch className="w-5 h-5" />}
                    />
                </div>

                {/* Status */}
                <Select
                    value={filter.status || ''}
                    onChange={(e) =>
                        onFilterChange({
                            ...filter,
                            status: e.target.value as TicketStatus | undefined || undefined,
                            pageNumber: 1,
                        })
                    }
                    placeholder="All Status"
                    options={TICKET_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                />

                {/* Priority */}
                <Select
                    value={filter.priority || ''}
                    onChange={(e) =>
                        onFilterChange({
                            ...filter,
                            priority: e.target.value as TicketPriority | undefined || undefined,
                            pageNumber: 1,
                        })
                    }
                    placeholder="All Priority"
                    options={TICKET_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
                />

                {/* Sort */}
                <Select
                    value={filter.sortBy || 'CreatedAt'}
                    onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value })}
                    options={SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
                />
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {/* Category */}
                <Select
                    value={filter.categoryId || ''}
                    onChange={(e) =>
                        onFilterChange({ ...filter, categoryId: e.target.value || undefined, pageNumber: 1 })
                    }
                    placeholder="All Categories"
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />

                {/* Department */}
                <Select
                    value={filter.departmentId || ''}
                    onChange={(e) =>
                        onFilterChange({ ...filter, departmentId: e.target.value || undefined, pageNumber: 1 })
                    }
                    placeholder="All Departments"
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {filter.status && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Status: {filter.status}
                            <button
                                onClick={() => onFilterChange({ ...filter, status: undefined })}
                                className="ml-2"
                            >
                                <HiX className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {filter.priority && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            Priority: {filter.priority}
                            <button
                                onClick={() => onFilterChange({ ...filter, priority: undefined })}
                                className="ml-2"
                            >
                                <HiX className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
};