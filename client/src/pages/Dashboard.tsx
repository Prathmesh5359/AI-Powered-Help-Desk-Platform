import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardStats } from '../types';
import { apiFetch } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { Ticket, CheckCircle2, Flame, HelpCircle, Terminal, CreditCard, ArrowRight, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<DashboardStats>('/stats');
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
        {error || 'Failed to render dashboard'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Executive Support Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time ticket processing, AI metrics, and ticket status monitoring.</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-100">{stats.overview.total}</div>
          <div className="text-[11px] text-slate-400">Total support cases registered</div>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{stats.overview.open}</div>
          <div className="text-[11px] text-slate-400">Requires agent or AI response</div>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400">{stats.overview.resolved}</div>
          <div className="text-[11px] text-slate-400">Successfully closed cases</div>
        </div>

        <div className="p-5 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Action</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400">{stats.overview.urgentOpen}</div>
          <div className="text-[11px] text-slate-400">High priority open items</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">General Inquiries</div>
            <div className="text-xl font-bold text-slate-100">{stats.byCategory.GENERAL_QUESTION}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Technical Bugs</div>
            <div className="text-xl font-bold text-slate-100">{stats.byCategory.TECHNICAL_QUESTION}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Refund & Billing</div>
            <div className="text-xl font-bold text-slate-100">{stats.byCategory.REFUND_REQUEST}</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Recent Support Inquiries</h3>
            <p className="text-xs text-slate-400">Latest tickets received in the queue.</p>
          </div>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All Queue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Ticket #</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recentTickets.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tickets/${t.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5 font-mono text-blue-400 font-semibold">{t.ticketNumber}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-100 max-w-xs truncate">{t.subject}</td>
                  <td className="px-4 py-3.5 text-slate-300">{t.customerName}</td>
                  <td className="px-4 py-3.5">
                    <CategoryBadge category={t.category} />
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
