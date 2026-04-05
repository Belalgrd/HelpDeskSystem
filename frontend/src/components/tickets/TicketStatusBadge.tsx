import React from 'react';
import { cn } from '../../utils/helpers';
import type { TicketStatus } from '../../types/ticket.types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const getStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    InProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
 
   Resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.Open;
};

const getStatusDotColor = (status: TicketStatus): string => {
 







 const colors: Record<TicketStatus, string> = {
    Open: 'bg-blue-500',
    InProgress: 'bg-yellow-500',
    Pending: 'bg-orange-500',
    Resolved: 'bg-green-500',
    Closed: 'bg-gray-500',
    Cancelled: 'bg-red-500',
  }






;
  return colors[status] || colors.Open;
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={cn(
 







       'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusColor(status)
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', getStatusDotColor(status))} />
 




     {status}
    </span>
  );
};
