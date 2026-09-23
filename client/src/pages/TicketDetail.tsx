import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, User, TicketStatus, TicketCategory, TicketPriority } from '../types';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ArrowLeft, Sparkles, Send, CheckCircle, UserCheck, Bot, User as UserIcon, RefreshCw, BookOpen } from 'lucide-react';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [generatingAiReply, setGeneratingAiReply] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [matchedKbArticles, setMatchedKbArticles] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTicketDetail = async () => {
    if (!id) return;
    try {
      const res = await apiFetch<{ ticket: Ticket }>(`/tickets/${id}`);
      setTicket(res.ticket);
      if (res.ticket.suggestedReply) {
        setAiSuggestion(res.ticket.suggestedReply);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (user?.role === 'ADMIN') {
      try {
        const res = await apiFetch<{ users: User[] }>('/users');
        setAgents(res.users.filter(u => u.role === 'AGENT' || u.role === 'ADMIN'));
      } catch (err) {
        console.error('Failed to load agents:', err);
      }
    }
  };

  useEffect(() => {
    fetchTicketDetail();
    fetchAgents();
  }, [id]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    setUpdating(true);
    try {
      const res = await apiFetch<{ ticket: Ticket }>(`/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setTicket(res.ticket);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!ticket) return;
    setUpdating(true);
    try {
      const res = await apiFetch<{ ticket: Ticket }>(`/tickets/${ticket.id}`, {
        method: 'PUT',
        body: JSON.stringify({ assignedAgentId: agentId || null }),
      });
      setTicket(res.ticket);
    } catch (err) {
      console.error('Failed to assign agent:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateAiResponse = async () => {
    if (!ticket) return;
    setGeneratingAiReply(true);
    try {
      const res = await apiFetch<{ reply: string; matchedArticles: string[] }>('/ai/suggest-reply', {
        method: 'POST',
        body: JSON.stringify({
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          customerName: ticket.customerName,
        }),
      });
      setAiSuggestion(res.reply);
      setMatchedKbArticles(res.matchedArticles);
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setGeneratingAiReply(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent, resolve: boolean = false) => {
    e.preventDefault();
    if (!ticket || !replyContent.trim()) return;

    setSendingReply(true);
    try {
      await apiFetch(`/tickets/${ticket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content: replyContent,
          resolveTicket: resolve,
          isAiGenerated: aiSuggestion && replyContent === aiSuggestion,
        }),
      });
      setReplyContent('');
      await fetchTicketDetail();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const useAiSuggestionInEditor = () => {
    if (aiSuggestion) {
      setReplyContent(aiSuggestion);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl">
        <h3 className="text-sm font-bold text-rose-400">Ticket Not Found</h3>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
        >
          Back to Ticket List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tickets')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Queue
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusChange('RESOLVED')}
            disabled={updating || ticket.status === 'RESOLVED'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark Resolved
          </button>
          <button
            onClick={() => handleStatusChange('CLOSED')}
            disabled={updating || ticket.status === 'CLOSED'}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Close Ticket
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Conversation Thread & Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header Card */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                {ticket.ticketNumber}
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <CategoryBadge category={ticket.category} />
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-100">{ticket.subject}</h1>

            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                {ticket.customerName}
              </div>
              <span>({ticket.customerEmail})</span>
              <span>•</span>
              <span>Submitted {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* AI Summary Banner */}
          {ticket.aiSummary && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Executive Summary
                </div>
                <span className="text-[10px] text-indigo-400 font-mono">Automated Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {ticket.aiSummary}
              </p>
            </div>
          )}

          {/* Messages Thread */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Conversation Thread</h3>

            {ticket.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 rounded-2xl glass-card space-y-2 ${
                  msg.senderType === 'CUSTOMER'
                    ? 'border-l-4 border-l-blue-500 bg-slate-900/40'
                    : msg.isAiGenerated
                    ? 'border-l-4 border-l-purple-500 bg-purple-950/20'
                    : 'border-l-4 border-l-emerald-500 bg-emerald-950/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    {msg.senderType === 'CUSTOMER' ? (
                      <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                    ) : msg.isAiGenerated ? (
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {msg.senderName}
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({msg.senderType})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pt-1">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={(e) => handleSendReply(e, false)} className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Agent Response Editor</h3>
              {aiSuggestion && (
                <button
                  type="button"
                  onClick={useAiSuggestionInEditor}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Insert AI Suggested Draft
                </button>
              )}
            </div>

            <textarea
              rows={5}
              placeholder="Type your response to the customer..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-all resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleGenerateAiResponse}
                disabled={generatingAiReply}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                {generatingAiReply ? 'Generating AI Suggestion...' : 'Re-Generate AI Suggestion'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSendReply(e as any, true)}
                  disabled={sendingReply || !replyContent.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Reply & Resolve
                </button>
                <button
                  type="submit"
                  disabled={sendingReply || !replyContent.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reply
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Column: AI Suggestions & Ticket Metadata */}
        <div className="space-y-6">
          {/* AI Response Generator Box */}
          <div className="p-5 rounded-2xl glass-card space-y-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Assistant Recommendation
              </div>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Knowledge Base Match
              </span>
            </div>

            {aiSuggestion ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                  {aiSuggestion}
                </div>

                <button
                  onClick={useAiSuggestionInEditor}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  Use This AI Reply in Editor
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                No AI draft loaded. Click below to query knowledge base.
              </div>
            )}

            {matchedKbArticles.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  Matched Articles:
                </div>
                {matchedKbArticles.map((art, idx) => (
                  <div key={idx} className="text-[11px] text-purple-300 font-medium truncate">
                    • {art}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Details & Assignment Panel */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider border-b border-slate-800 pb-3">
              Ticket Control Panel
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                <CategoryBadge category={ticket.category} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
                <PriorityBadge priority={ticket.priority} />
              </div>

              {user?.role === 'ADMIN' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Assigned Agent</label>
                  <select
                    value={ticket.assignedAgentId || ''}
                    onChange={(e) => handleAssignAgent(e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
