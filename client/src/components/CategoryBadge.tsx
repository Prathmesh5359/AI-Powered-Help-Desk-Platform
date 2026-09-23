import React from 'react';
import { TicketCategory } from '../types';
import { HelpCircle, Terminal, CreditCard } from 'lucide-react';

export const CategoryBadge: React.FC<{ category: TicketCategory }> = ({ category }) => {
  const config: Record<TicketCategory, { label: string; icon: React.ReactNode; color: string }> = {
    GENERAL_QUESTION: {
      label: 'General Question',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    TECHNICAL_QUESTION: {
      label: 'Technical Question',
      icon: <Terminal className="w-3.5 h-3.5" />,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    REFUND_REQUEST: {
      label: 'Refund Request',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
  };

  const item = config[category] || config.GENERAL_QUESTION;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border ${item.color}`}>
      {item.icon}
      {item.label}
    </span>
  );
};
