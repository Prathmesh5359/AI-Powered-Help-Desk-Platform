import React, { useState } from 'react';
import { apiFetch } from '../api/client';
import { X, Sparkles, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewTicketModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !subject || !description) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail,
          subject,
          description,
        }),
      });

      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100 text-base">Submit Support Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Issue Summary</label>
            <input
              type="text"
              placeholder="e.g. Billing query regarding recent payment"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>AI will automatically analyze, assign category & priority, and prepare an initial suggested response.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              {loading ? (
                <span>AI Processing Ticket...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
