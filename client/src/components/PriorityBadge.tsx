import React from 'react';
import { TicketPriority } from '../types';
import { AlertTriangle, ArrowUp, ArrowDown, Flame } from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const config: Record<TicketPriority, { style: string; icon: React.ReactNode }> = {
    LOW: {
      style: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: <ArrowDown className="w-3 h-3" />,
    },
    MEDIUM: {
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    HIGH: {
      style: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: <ArrowUp className="w-3 h-3" />,
    },
    URGENT: {
      style: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse-subtle',
      icon: <Flame className="w-3 h-3 text-rose-400" />,
    },
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md border ${config[priority].style}`}>
      {config[priority].icon}
      {priority}
    </span>
  );
};
