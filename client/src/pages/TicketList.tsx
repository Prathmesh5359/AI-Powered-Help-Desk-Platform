import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, TicketStatus, TicketCategory, TicketPriority } from '../types';
import { apiFetch } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { Search, Filter, MessageSquare, UserCheck, ArrowUpDown, Sparkles } from 'lucide-react';

export const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('ALL');

  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);
      if (assignmentFilter !== 'ALL') params.append('assignedTo', assignmentFilter);
      if (search) params.append('search', search);

      const res = await apiFetch<{ tickets: Ticket[] }>(`/tickets?${params.toString()}`);
      setTickets(res.tickets);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, assignmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Ticket Queue
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
              {tickets.length} tickets
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Filter, search, and manage incoming support inquiries.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket #, subject, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          Filters:
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Status: All</option>
          <option value="OPEN">Status: Open</option>
          <option value="RESOLVED">Status: Resolved</option>
          <option value="CLOSED">Status: Closed</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Category: All</option>
          <option value="GENERAL_QUESTION">General Question</option>
          <option value="TECHNICAL_QUESTION">Technical Question</option>
          <option value="REFUND_REQUEST">Refund Request</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Priority: All</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Assignment Filter */}
        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">Assignment: All</option>
          <option value="ME">Assigned to Me</option>
          <option value="UNASSIGNED">Unassigned</option>
        </select>
      </div>

      {/* Ticket List Table / Cards */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Tickets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No support tickets matching your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="p-5 rounded-2xl glass-card cursor-pointer hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {ticket.ticketNumber}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <CategoryBadge category={ticket.category} />
                </div>

                <h3 className="font-semibold text-slate-100 text-sm hover:text-blue-300 transition-colors">
                  {ticket.subject}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ticket.description}
                </p>

                {ticket.aiSummary && (
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate"><strong className="font-semibold">AI Summary:</strong> {ticket.aiSummary}</span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 gap-2 shrink-0">
                <div className="text-xs text-slate-300 font-medium">
                  {ticket.customerName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {ticket.assignedAgent ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      {ticket.assignedAgent.name}
                    </span>
                  ) : (
                    <span className="text-amber-400/80 font-medium">Unassigned</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
