import React from 'react';
import { HiArrowDown, HiMinus, HiArrowUp, HiExclamation } from 'react-icons/hi';
import { cn } from '../../utils/helpers';
import type { TicketPriority } from '../../types/ticket.types';

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
}

const getPriorityColor = (priority: TicketPriority): string => {
  const colors: Record<TicketPriority, string> = {
    Low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority] || colors.Medium;
};

const priorityIcons: Record<TicketPriority, React.ComponentType<{ className?: string }>> = {
 







 Low: HiArrowDown,
  Medium: HiMinus,
  High: HiArrowUp,
  Critical: HiExclamation,
};

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority }) => {
 






 const Icon = priorityIcons[priority] || HiMinus;

  return (
    <span
      className={cn(
 




       'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getPriorityColor(priority)
      )}
  


  >
      <Icon className="w-3 h-3 mr-1" />
      {priority}
    </span>
  );
};
