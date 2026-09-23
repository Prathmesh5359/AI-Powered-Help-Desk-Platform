import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';
import { Sparkles, Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(res.token, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 glass-panel">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">AI Help Desk Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Automated Ticket Routing & Agent Assistance</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="agent@helpdesk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                Sign In to Workspace <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick Demo Login Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemoCreds('admin@helpdesk.com')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-blue-400 text-left transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin User
            </button>
            <button
              onClick={() => fillDemoCreds('sarah.agent@helpdesk.com')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-emerald-400 text-left transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Support Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
