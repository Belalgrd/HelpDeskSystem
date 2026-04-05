import React from 'react';
import { Link } from 'react-router-dom';
import { HiChat, HiPaperClip } from 'react-icons/hi';
import type { Ticket } from '../../types/ticket.types';
import { Avatar } from '../common/Avatar';
import { TicketStatusBadge } from './TicketStatusBadge';
import { TicketPriorityBadge } from './TicketPriorityBadge';
import { formatRelativeTime } from '../../utils/helpers';

interface TicketCardProps {
    ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    return (
        <Link
            to={`/tickets/${ticket.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <TicketStatusBadge status={ticket.status} />
                    <TicketPriorityBadge priority={ticket.priority} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.ticketNumber}</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {ticket.title}
            </h3>

            {/* Meta */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{ticket.categoryName}</span>
                <span>•</span>
                <span>{ticket.departmentName}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <Avatar src={ticket.requesterAvatar} name={ticket.requesterName} size="sm" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ticket.requesterName}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-gray-400">
                    {ticket.commentsCount > 0 && (
                        <span className="flex items-center space-x-1">
                            <HiChat className="w-4 h-4" />
                            <span>{ticket.commentsCount}</span>
                        </span>
                    )}
                    {ticket.attachmentsCount > 0 && (
                        <span className="flex items-center space-x-1">
                            <HiPaperClip className="w-4 h-4" />
                            <span>{ticket.attachmentsCount}</span>
                        </span>
                    )}
                    <span>{formatRelativeTime(ticket.createdAt)}</span>
                </div>
            </div>
        </Link>
    );
};