import React from 'react';
import { TicketStatus } from '../types';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    RESOLVED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  const dots: Record<TicketStatus, string> = {
    OPEN: 'bg-emerald-400 animate-pulse',
    RESOLVED: 'bg-blue-400',
    CLOSED: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};
