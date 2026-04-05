// src/components/dashboard/RecentTickets.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { HiTicket, HiArrowRight } from 'react-icons/hi';
import { TicketStatusBadge } from '../tickets/TicketStatusBadge';
import { formatRelativeTime } from '../../utils/helpers';
import type { Ticket } from '../../types/ticket.types';

interface RecentTicketsProps {
    tickets: Ticket[];
    isLoading?: boolean;
}

export const RecentTickets: React.FC<RecentTicketsProps> = ({ tickets, isLoading }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Tickets
                    </h3>
                    <Link
                        to="/tickets"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                    >
                        View All
                        <HiArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <HiTicket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No recent tickets</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {ticket.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {ticket.ticketNumber} <span className="mx-1">-</span> {ticket.requesterName}
                                    </p>
                                </div>
                                <div className="ml-4 flex flex-col items-end space-y-1">
                                    <TicketStatusBadge status={ticket.status} />
                                    <span className="text-xs text-gray-500">
                                        {formatRelativeTime(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};