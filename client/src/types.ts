export type UserRole = 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  _count?: {
    assignedTickets: number;
  };
}

export type TicketStatus = 'OPEN' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'GENERAL_QUESTION' | 'TECHNICAL_QUESTION' | 'REFUND_REQUEST';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  aiSummary?: string | null;
  suggestedReply?: string | null;
  assignedAgentId?: string | null;
  assignedAgent?: User | null;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface DashboardStats {
  overview: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
    urgentOpen: number;
  };
  byCategory: {
    GENERAL_QUESTION: number;
    TECHNICAL_QUESTION: number;
    REFUND_REQUEST: number;
  };
  recentTickets: Ticket[];
}
